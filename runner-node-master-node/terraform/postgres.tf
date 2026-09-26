resource "azurerm_postgresql_flexible_server" "postgres" {
  name                   = var.postgres_server_name
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  version                = "16"
  delegated_subnet_id    = azurerm_subnet.postgres_subnet.id
  private_dns_zone_id    = azurerm_private_dns_zone.postgres_dns.id
  administrator_login    = var.postgres_admin_user
  administrator_password = var.postgres_admin_password

  storage_mb   = 32768
  sku_name     = "GP_Standard_D2s_v3"
  storage_tier = "P10"

  backup_retention_days        = 30
  geo_redundant_backup_enabled = false

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres_dns_link]

  tags = azurerm_resource_group.rg.tags
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = "aidatabase"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Enforce SSL Connection
resource "azurerm_postgresql_flexible_server_configuration" "ssl" {
  name      = "require_secure_transport"
  server_id = azurerm_postgresql_flexible_server.postgres.id
  value     = "ON"
}
