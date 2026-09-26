import difflib
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.entities import KnowledgeRecord, ChatMessage

class ComparisonService:
    """
    Compares incoming prompts, configs, or documents against historical
    records in the database to detect overlaps, duplicates, version differences,
    and historical references.
    """

    def _tokenize(self, text: str) -> set[str]:
        words = re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', text.lower())
        return set(words)

    def _calculate_jaccard_similarity(self, set_a: set[str], set_b: set[str]) -> float:
        if not set_a or not set_b:
            return 0.0
        intersection = len(set_a.intersection(set_b))
        union = len(set_a.union(set_b))
        return intersection / union if union > 0 else 0.0

    def _calculate_sequence_ratio(self, text_a: str, text_b: str) -> float:
        return difflib.SequenceMatcher(None, text_a.lower(), text_b.lower()).ratio()

    def _generate_diff_summary(self, new_text: str, historical_text: str) -> str:
        new_lines = new_text.strip().splitlines()
        hist_lines = historical_text.strip().splitlines()
        matcher = difflib.SequenceMatcher(None, hist_lines, new_lines)
        
        matches = matcher.get_matching_blocks()
        total_shared_chars = sum(m.size for m in matches)
        
        if total_shared_chars == 0:
            return "Completely distinct content with novel keywords."
        
        diff_snippets = []
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'replace':
                diff_snippets.append(f"Modified: '{historical_text[i1:i2][:30]}...' -> '{new_text[j1:j2][:30]}...'")
            elif tag == 'insert':
                diff_snippets.append(f"Added new context: '{new_text[j1:j2][:40]}...'")
            elif tag == 'delete':
                diff_snippets.append(f"Omitted existing context: '{historical_text[i1:i2][:40]}...'")
        
        if not diff_snippets:
            return "Exact or near-identical content match."
        return " | ".join(diff_snippets[:3])

    async def compare_with_database(
        self,
        db: AsyncSession,
        input_text: str,
        category: Optional[str] = None,
        threshold: float = 0.25,
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Scans KnowledgeRecord and historical ChatMessage tables and returns
        ranked similarity matches.
        """
        input_tokens = self._tokenize(input_text)
        input_clean = input_text.strip()
        
        matches: List[Dict[str, Any]] = []

        # 1. Scan KnowledgeRecords
        stmt_kr = select(KnowledgeRecord)
        if category:
            stmt_kr = stmt_kr.where(KnowledgeRecord.category == category)
        result_kr = await db.execute(stmt_kr)
        knowledge_records = result_kr.scalars().all()

        total_checked = len(knowledge_records)

        for rec in knowledge_records:
            rec_tokens = self._tokenize(rec.content + " " + rec.title)
            jaccard = self._calculate_jaccard_similarity(input_tokens, rec_tokens)
            seq_ratio = self._calculate_sequence_ratio(input_clean, rec.content)
            
            # Weighted hybrid score (40% token overlap + 60% sequence similarity)
            hybrid_score = (jaccard * 0.45) + (seq_ratio * 0.55)
            similarity_pct = round(hybrid_score * 100, 1)

            if hybrid_score >= threshold or jaccard > 0.3:
                match_type = "High Match (Potential Duplicate)" if similarity_pct >= 75 else \
                             "Partial Match (Related Architecture)" if similarity_pct >= 40 else "Semantic Overlap"
                
                diff_summary = self._generate_diff_summary(input_clean, rec.content)

                matches.append({
                    "record_id": rec.id,
                    "title": rec.title,
                    "category": rec.category,
                    "historical_content": rec.content,
                    "similarity_score": similarity_pct,
                    "match_type": match_type,
                    "diff_summary": diff_summary,
                    "source_type": "KnowledgeBase"
                })

        # 2. Scan Recent User Prompts / Historical Messages
        stmt_msg = select(ChatMessage).where(ChatMessage.role == "user").limit(50)
        result_msg = await db.execute(stmt_msg)
        chat_messages = result_msg.scalars().all()
        total_checked += len(chat_messages)

        for msg in chat_messages:
            msg_tokens = self._tokenize(msg.content)
            jaccard = self._calculate_jaccard_similarity(input_tokens, msg_tokens)
            seq_ratio = self._calculate_sequence_ratio(input_clean, msg.content)
            hybrid_score = (jaccard * 0.4) + (seq_ratio * 0.6)
            similarity_pct = round(hybrid_score * 100, 1)

            if hybrid_score >= max(threshold, 0.4):
                match_type = "Identical Prompt" if similarity_pct >= 85 else "Similar Past Query"
                diff_summary = self._generate_diff_summary(input_clean, msg.content)
                matches.append({
                    "record_id": msg.id,
                    "title": f"Historical Chat Message ({msg.created_at.strftime('%Y-%m-%d %H:%M')})",
                    "category": "ChatHistory",
                    "historical_content": msg.content,
                    "similarity_score": similarity_pct,
                    "match_type": match_type,
                    "diff_summary": diff_summary,
                    "source_type": "HistoricalChat"
                })

        # Sort matches by highest similarity score
        matches.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_matches = matches[:limit]

        highest_similarity = top_matches[0]["similarity_score"] if top_matches else 0.0
        is_duplicate = highest_similarity >= 80.0

        if is_duplicate:
            recommendation = f"High similarity ({highest_similarity}%) detected against existing database record '{top_matches[0]['title']}'. Review historical answer before generating new duplicate runs."
        elif highest_similarity >= 40.0:
            recommendation = f"Related historical context found ({highest_similarity}% similarity). Database context has been primed for the AI model."
        else:
            recommendation = "Input appears novel. No major duplicate records in the database. New entry will be saved to history."

        return {
            "input_analyzed": input_clean,
            "total_db_records_checked": total_checked,
            "matches_found": len(top_matches),
            "highest_similarity": highest_similarity,
            "is_duplicate_or_similar": is_duplicate,
            "recommendation": recommendation,
            "matches": top_matches
        }

comparison_service = ComparisonService()
