output "cluster_name" {
  value = google_container_cluster.primary.name
}

output "artifact_registry_repo" {
  value = google_artifact_registry_repository.app.name
}

output "cloud_sql_instance" {
  value = google_sql_database_instance.postgres.name
}
