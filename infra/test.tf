resource "null_resource" "gha_test" {
  triggers = {
    note = "Triggering GitHub Actions from new branch"
  }
}