variable "project_id" {
  description = "GCP project ID"
  type        = string
  default     = "taskflow-project"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  type    = string
  default = "us-central1-a"
}
