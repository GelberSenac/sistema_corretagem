require "test_helper"

class DashboardControllerTest < ActionDispatch::IntegrationTest
  test "GET /api/v1/dashboard_stats sem autenticação retorna 401" do
    get "/api/v1/dashboard_stats"
    assert_response :unauthorized
  end
end
