resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.aks_cluster_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "aks-enterprise-ai"
  kubernetes_version  = "1.29"

  default_node_pool {
    name                = "systempool"
    node_count          = 2
    vm_size             = "Standard_D4s_v5"
    vnet_subnet_id      = azurerm_subnet.aks_subnet.id
    enable_auto_scaling = true
    min_count           = 2
    max_count           = 5
    os_disk_size_gb     = 100
    type                = "VirtualMachineScaleSets"
    node_labels = {
      "nodepool" = "system"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin      = "azure"
    network_plugin_mode = "overlay"
    ebpf_data_plane     = "cilium"
    load_balancer_sku   = "standard"
    service_cidr        = "10.1.0.0/16"
    dns_service_ip      = "10.1.0.10"
  }

  tags = azurerm_resource_group.rg.tags
}

# Dedicated Worker / Runner Node Pool for AI Inference and CI/CD Runners
resource "azurerm_kubernetes_cluster_node_pool" "worker_pool" {
  name                  = "workerpool"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.aks.id
  vm_size               = "Standard_D8s_v5"
  vnet_subnet_id        = azurerm_subnet.aks_subnet.id
  enable_auto_scaling   = true
  min_count             = 1
  max_count             = 10
  os_disk_size_gb       = 128
  priority              = "Regular"

  node_labels = {
    "workload" = "ai-inference-and-runners"
    "role"     = "worker"
  }

  tags = azurerm_resource_group.rg.tags
}
