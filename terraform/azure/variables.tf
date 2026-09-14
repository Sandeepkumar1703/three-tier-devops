variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  type    = string
  default = "taskflow-rg"
}

variable "project_name" {
  type    = string
  default = "taskflow"
}

variable "tags" {
  type = map(string)
  default = {
    environment = "dev"
    project     = "taskflow"
  }
}
