resource "google_compute_network" "vpc" {
  name                    = "taskflow-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "cluster" {
  name          = "taskflow-subnet"
  ip_cidr_range = "10.2.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
}

resource "google_container_cluster" "primary" {
  name     = "taskflow-gke"
  location = var.zone

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.vpc.id
  subnetwork = google_compute_subnetwork.cluster.id
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "taskflow-node-pool"
  location   = var.zone
  cluster    = google_container_cluster.primary.name
  node_count = 2

  node_config {
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

resource "google_artifact_registry_repository" "app" {
  location      = var.region
  repository_id = "taskflow-repo"
  format        = "DOCKER"
}

resource "google_sql_database_instance" "postgres" {
  name             = "taskflow-postgres"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = false
      private_network = google_compute_network.vpc.id
    }
  }
}
