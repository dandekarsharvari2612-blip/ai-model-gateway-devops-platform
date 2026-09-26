variable "resource_group_name" {
  type        = string
  default     = "rg-enterprise-ai-aks"
  description = "Name of the Azure Resource Group"
}

variable "location" {
  type        = string
  default     = "eastus2"
  description = "Azure region for deployment"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Target deployment environment"
}

variable "aks_cluster_name" {
  type        = string
  default     = "aks-enterprise-ai-cluster"
  description = "Name of the Azure Kubernetes Service cluster"
}

variable "acr_name" {
  type        = string
  default     = "acrenterpriseai2026"
  description = "Unique name for Azure Container Registry"
}

variable "postgres_server_name" {
  type        = string
  default     = "psql-enterprise-ai-flexible"
  description = "Unique name for Azure PostgreSQL Flexible Server"
}

variable "postgres_admin_user" {
  type        = string
  default     = "dbadmin"
  description = "Administrator username for PostgreSQL"
}

variable "postgres_admin_password" {
  type        = string
  default     = "AzureSecurePsql2026!Pass"
  sensitive   = true
  description = "Administrator password for PostgreSQL"
}
