#!/bin/bash

# RetailPass Complete Integration Test Suite
# Tests user registration, authentication, and profile management flows
# Uses demo credentials: admin@retailpass.com, vendor@retailpass.com, user@test.com

set -e

API_URL="${TEST_API_URL:-http://localhost:9002}"
COOKIE_DIR="/tmp/retailpass-test-cookies"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

mkdir -p "$COOKIE_DIR"

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_pass() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((TESTS_PASSED++))
}

log_fail() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((TESTS_FAILED++))
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if server is running
check_server() {
  log_info "Checking server at $API_URL..."
  if curl -s -f "$API_URL/api/health" > /dev/null; then
    log_pass "Server is running"
    return 0
  else
    log_fail "Server is not running at $API_URL"
    log_info "Start server with: npm run dev"
    return 1
  fi
}

# Test user signup
test_signup() {
  local email="$1"
  local password="$2"
  local name="$3"
  local role="${4:-CUSTOMER}"
  local cookie_file="$COOKIE_DIR/$(echo $email | tr '@.' '__').txt"

  log_info "Testing signup for $email ($role)..."

  local response
  response=$(curl -s -X POST "$API_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"name\":\"$name\",\"role\":\"$role\"}" \
    -c "$cookie_file" \
    -w "\n%{http_code}")

  local http_code
  http_code=$(echo "$response" | tail -n1)
  local body
  body=$(echo "$response" | head -n -1)

  if [[ "$http_code" == "201" ]]; then
    local user_id
    user_id=$(echo "$body" | jq -r '.user.id')
    log_pass "Signup successful for $email (ID: $user_id)"
    echo "$user_id"
    return 0
  elif [[ "$http_code" == "409" ]]; then
    log_warn "User $email already exists (409 Conflict)"
    # Try to login instead to get cookie
    test_login "$email" "$password" > /dev/null
    local user_id
    user_id=$(curl -s -b "$cookie_file" "$API_URL/api/auth/me" | jq -r '.user.id')
    echo "$user_id"
    return 0
  else
    log_fail "Signup failed for $email (HTTP $http_code): $body"
    return 1
  fi
}

# Test user login
test_login() {
  local email="$1"
  local password="$2"
  local cookie_file="$COOKIE_DIR/$(echo $email | tr '@.' '__').txt"

  log_info "Testing login for $email..."

  local response
  response=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}" \
    -c "$cookie_file" \
    -w "\n%{http_code}")

  local http_code
  http_code=$(echo "$response" | tail -n1)
  local body
  body=$(echo "$response" | head -n -1)

  if [[ "$http_code" == "200" ]]; then
    local user_id role
    user_id=$(echo "$body" | jq -r '.user.id')
    role=$(echo "$body" | jq -r '.user.role')
    log_pass "Login successful for $email (ID: $user_id, Role: $role)"
    echo "$user_id"
    return 0
  else
    log_fail "Login failed for $email (HTTP $http_code): $body"
    return 1
  fi
}

# Test get current user (/api/auth/me)
test_me() {
  local email="$1"
  local cookie_file="$COOKIE_DIR/$(echo $email | tr '@.' '__').txt"

  log_info "Testing /api/auth/me for $email..."

  local response
  response=$(curl -s -X GET "$API_URL/api/auth/me" \
    -b "$cookie_file" \
    -w "\n%{http_code}")

  local http_code
  http_code=$(echo "$response" | tail -n1)
  local body
  body=$(echo "$response" | head -n -1)

  if [[ "$http_code" == "200" ]]; then
    local user_id role
    user_id=$(echo "$body" | jq -r '.user.id')
    role=$(echo "$body" | jq -r '.user.role')
    log_pass "/api/auth/me successful for $email (ID: $user_id, Role: $role)"
    return 0
  else
    log_fail "/api/auth/me failed for $email (HTTP $http_code): $body"
    return 1
  fi
}

# Test profile update
test_profile_update() {
  local email="$1"
  local new_name="$2"
  local new_email="${3:-}"
  local cookie_file="$COOKIE_DIR/$(echo $email | tr '@.' '__').txt"

  log_info "Testing profile update for $email..."

  local data="{\"name\":\"$new_name\"}"
  if [[ -n "$new_email" ]]; then
    data="{\"name\":\"$new_name\",\"email\":\"$new_email\"}"
  fi

  local response
  response=$(curl -s -X PUT "$API_URL/api/auth/profile" \
    -H "Content-Type: application/json" \
    -b "$cookie_file" \
    -d "$data" \
    -w "\n%{http_code}")

  local http_code
  http_code=$(echo "$response" | tail -n1)
  local body
  body=$(echo "$response" | head -n -1)

  if [[ "$http_code" == "200" ]]; then
    local user_id name
    user_id=$(echo "$body" | jq -r '.user.id')
    name=$(echo "$body" | jq -r '.user.name')
    log_pass "Profile update successful for $email (Name: $name)"
    return 0
  else
    log_fail "Profile update failed for $email (HTTP $http_code): $body"
    return 1
  fi
}

# Test password update
test_password_update() {
  local email="$1"
  local old_password="$2"
  local new_password="$3"
  local cookie_file="$COOKIE_DIR/$(echo $email | tr '@.' '__').txt"

  log_info "Testing password update for $email..."

  local response
  response=$(curl -s -X PUT "$API_URL/api/profile/update-password" \
    -H "Content-Type: application/json" \
    -b "$cookie_file" \
    -d "{\"currentPassword\":\"$old_password\",\"newPassword\":\"$new_password\"}" \
    -w "\n%{http_code}")

  local http_code
  http_code=$(echo "$response" | tail -n1)
  local body
  body=$(echo "$response" | head -n -1)

  if [[ "$http_code" == "200" ]]; then
    log_pass "Password update successful for $email"
    return 0
  else
    log_fail "Password update failed for $email (HTTP $http_code): $body"
    return 1
  fi
}

# Test logout
test_logout() {
  local email="$1"
  local cookie_file="$COOKIE_DIR/$(echo $email | tr '@.' '__').txt"

  log_info "Testing logout for $email..."

  local response
  response=$(curl -s -X POST "$API_URL/api/auth/logout" \
    -b "$cookie_file" \
    -c "$cookie_file" \
    -w "\n%{http_code}")

  local http_code
  http_code=$(echo "$response" | tail -n1)
  local body
  body=$(echo "$response" | head -n -1)

  if [[ "$http_code" == "200" ]]; then
    log_pass "Logout successful for $email"
    return 0
  else
    log_fail "Logout failed for $email (HTTP $http_code): $body"
    return 1
  fi
}

# Test protected route without auth
test_unauthorized_access() {
  log_info "Testing unauthorized access to protected route..."

  local response
  response=$(curl -s -X GET "$API_URL/api/auth/me" \
    -w "\n%{http_code}")

  local http_code
  http_code=$(echo "$response" | tail -n1)

  if [[ "$http_code" == "200" ]]; then
    local user
    user=$(echo "$response" | head -n -1 | jq -r '.user')
    if [[ "$user" == "null" ]]; then
      log_pass "Unauthorized access correctly returns null user"
      return 0
    else
      log_fail "Unauthorized access returned user data: $user"
      return 1
    fi
  else
    log_fail "Unexpected HTTP code for unauthorized access: $http_code"
    return 1
  fi
}

# Test password strength analysis
test_password_analysis() {
  log_info "Testing password strength analysis..."

  local response
  response=$(curl -s -X POST "$API_URL/api/analyze-password" \
    -H "Content-Type: application/json" \
    -d '{"password":"TestPass123!"}' \
    -w "\n%{http_code}")

  local http_code
  http_code=$(echo "$response" | tail -n1)
  local body
  body=$(echo "$response" | head -n -1)

  if [[ "$http_code" == "200" ]]; then
    local strength
    strength=$(echo "$body" | jq -r '.strength')
    log_pass "Password analysis successful (strength: $strength)"
    return 0
  else
    log_fail "Password analysis failed (HTTP $http_code): $body"
    return 1
  fi
}

# Test forgot password flow
test_forgot_password() {
  local email="$1"

  log_info "Testing forgot password for $email..."

  local response
  response=$(curl -s -X POST "$API_URL/api/auth/forgot-password" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\"}" \
    -w "\n%{http_code}")

  local http_code
  http_code=$(echo "$response" | tail -n1)
  local body
  body=$(echo "$response" | head -n -1)

  if [[ "$http_code" == "200" ]]; then
    log_pass "Forgot password request successful for $email"
    return 0
  else
    log_fail "Forgot password failed for $email (HTTP $http_code): $body"
    return 1
  fi
}

# Main test execution
main() {
  echo "=========================================="
  echo "RetailPass Integration Test Suite"
  echo "=========================================="
  echo "API URL: $API_URL"
  echo "Demo credentials:"
  echo "  ADMIN:    admin@retailpass.com"
  echo "  VENDOR:   vendor@retailpass.com"
  echo "  CUSTOMER: user@test.com"
  echo "=========================================="
  echo ""

  # Check server
  check_server || exit 1
  echo ""

  # Test 1: Unauthorized access
  log_info "--- Test: Unauthorized Access ---"
  test_unauthorized_access
  echo ""

  # Test 2: Password strength analysis
  log_info "--- Test: Password Strength Analysis ---"
  test_password_analysis
  echo ""

  # Test 3: Admin user flow
  log_info "=== ADMIN USER FLOW ==="
  ADMIN_ID=$(test_signup "admin@retailpass.com" "AdminPass123!" "Admin User" "ADMIN")
  test_login "admin@retailpass.com" "AdminPass123!" > /dev/null
  test_me "admin@retailpass.com"
  test_profile_update "admin@retailpass.com" "Admin User Updated"
  test_password_update "admin@retailpass.com" "AdminPass123!" "NewAdminPass456!"
  test_login "admin@retailpass.com" "NewAdminPass456!" > /dev/null
  test_me "admin@retailpass.com"
  test_logout "admin@retailpass.com"
  echo ""

  # Test 4: Vendor user flow
  log_info "=== VENDOR USER FLOW ==="
  VENDOR_ID=$(test_signup "vendor@retailpass.com" "VendorPass123!" "Vendor User" "VENDOR")
  test_login "vendor@retailpass.com" "VendorPass123!" > /dev/null
  test_me "vendor@retailpass.com"
  test_profile_update "vendor@retailpass.com" "Vendor User Updated"
  test_password_update "vendor@retailpass.com" "VendorPass123!" "NewVendorPass456!"
  test_login "vendor@retailpass.com" "NewVendorPass456!" > /dev/null
  test_me "vendor@retailpass.com"
  test_logout "vendor@retailpass.com"
  echo ""

  # Test 5: Customer user flow
  log_info "=== CUSTOMER USER FLOW ==="
  CUSTOMER_ID=$(test_signup "user@test.com" "UserPass123!" "Customer User" "CUSTOMER")
  test_login "user@test.com" "UserPass123!" > /dev/null
  test_me "user@test.com"
  test_profile_update "user@test.com" "Customer User Updated"
  test_password_update "user@test.com" "UserPass123!" "NewCustomerPass456!"
  test_login "user@test.com" "NewCustomerPass456!" > /dev/null
  test_me "user@test.com"
  test_logout "user@test.com"
  echo ""

  # Test 6: Forgot password flow
  log_info "=== FORGOT PASSWORD FLOW ==="
  test_forgot_password "admin@retailpass.com"
  test_forgot_password "vendor@retailpass.com"
  test_forgot_password "user@test.com"
  # Test with non-existent email (should still return 200 for security)
  test_forgot_password "nonexistent@retailpass.com"
  echo ""

  # Test 7: Duplicate signup prevention
  log_info "=== DUPLICATE SIGNUP PREVENTION ==="
  log_info "Testing duplicate signup prevention..."
  response=$(curl -s -X POST "$API_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@retailpass.com","password":"AnotherPass123!","name":"Duplicate Admin"}' \
    -w "\n%{http_code}")
  http_code=$(echo "$response" | tail -n1)
  if [[ "$http_code" == "409" ]]; then
    log_pass "Duplicate signup correctly rejected (409 Conflict)"
  else
    log_fail "Duplicate signup should return 409, got $http_code"
  fi
  echo ""

  # Summary
  echo "=========================================="
  echo "TEST SUMMARY"
  echo "=========================================="
  echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
  echo -e "${RED}Failed: $TESTS_FAILED${NC}"
  echo "=========================================="

  if [[ $TESTS_FAILED -eq 0 ]]; then
    log_pass "ALL TESTS PASSED!"
    exit 0
  else
    log_fail "SOME TESTS FAILED"
    exit 1
  fi
}

main "$@"