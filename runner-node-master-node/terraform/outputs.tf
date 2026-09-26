output "aks_cluster_name" {
  value       = azurerm_kubernetes_cluster.aks.name
  description = "AKS Cluster Name"
}

output "aks_get_credentials_command" {
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.rg.name} --name ${azurerm_kubernetes_cluster.aks.name} --overwrite-existing"
  description = "Command to configure local kubectl context for AKS"
}

output "acr_login_server" {
  value       = azurerm_container_registry.acr.login_server
  description = "ACR Login Server URI"
}

output "postgres_fqdn" {
  value       = azurerm_postgresql_flexible_server.postgres.fqdn
  description = "Fully Qualified Domain Name for Azure PostgreSQL"
}

output "database_connection_string" {
  value       = "postgresql+asyncpg://${var.postgres_admin_user}:${var.postgres_admin_password}@${azurerm_postgresql_flexible_server.postgres.fqdn}:5432/aidatabase?ssl=require"
  sensitive   = true
  description = "Backend async connection string"
}
