#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# API smoke tests for the Syntex Terrors attendance system.
#
# Prerequisites:
#   - MongoDB running on localhost:27017 (or MONGODB_URI configured)
#   - Dev server running on http://localhost:3000 (npm run dev)
#
# Usage:  bash scripts/api-tests.sh
# ---------------------------------------------------------------------------
set -u

BASE="${1:-http://localhost:3000}"
PASS=0
FAIL=0

say()  { printf '\n\033[1;34m== %s ==\033[0m\n' "$*"; }
ok()   { PASS=$((PASS+1)); printf '  \033[32mPASS\033[0m %s\n' "$*"; }
bad()  { FAIL=$((FAIL+1)); printf '  \033[31mFAIL\033[0m %s\n' "$*"; }

# assert_contains <name> <haystack> <needle>
assert_contains() {
  if printf '%s' "$2" | grep -q "$3"; then ok "$1"; else bad "$1 — expected to contain: $3  got: $(printf '%s' "$2" | head -c 200)"; fi
}
assert_not_contains() {
  if printf '%s' "$2" | grep -q "$3"; then bad "$1 — expected NOT to contain: $3"; else ok "$1"; fi
}

req() { # req <method> <path> [json-body]
  local method="$1" path="$2" body="${3:-}"
  if [ -n "$body" ]; then
    curl -s -X "$method" -H 'Content-Type: application/json' -d "$body" "$BASE$path"
  else
    curl -s -X "$method" "$BASE$path"
  fi
}

command -v jq >/dev/null 2>&1 || { echo "jq is required"; exit 1; }

say "Health"
assert_contains "health responds ok" "$(req GET /api/health)" '"ok":true'

say "Seeding"
assert_contains "seed succeeds" "$(req POST /api/seed)" '"success":true'

say "Auth / login"
STUDENT_LOGIN=$(req POST /api/auth/login '{"email":"nitish@student.edu","password":"password123","role":"student"}')
assert_contains "student login works" "$STUDENT_LOGIN" '"success":true'
STUDENT_TOKEN=$(echo "$STUDENT_LOGIN" | jq -r .token)
STUDENT_ID=$(echo "$STUDENT_LOGIN" | jq -r .user.id)

TEACHER_LOGIN=$(req POST /api/auth/login '{"email":"sweta.choubey@college.edu","password":"password123","role":"teacher"}')
assert_contains "teacher login works" "$TEACHER_LOGIN" '"success":true'
TEACHER_TOKEN=$(echo "$TEACHER_LOGIN" | jq -r .token)
TEACHER_ID=$(echo "$TEACHER_LOGIN" | jq -r .user.id)

ADMIN_LOGIN=$(req POST /api/auth/login '{"email":"admin@college.edu","password":"password123","role":"admin"}')
assert_contains "admin login works" "$ADMIN_LOGIN" '"success":true'

assert_contains "wrong password rejected" "$(req POST /api/auth/login '{"email":"nitish@student.edu","password":"wrong","role":"student"}')" 'Invalid email or password'
assert_contains "wrong role rejected" "$(req POST /api/auth/login '{"email":"nitish@student.edu","password":"password123","role":"teacher"}')" 'not registered as'
assert_contains "missing fields rejected" "$(req POST /api/auth/login '{"email":"x@y.z"}')" 'required'

say "Auth / register"
NEW_USER=$(req POST /api/auth/register '{"email":"test.student@student.edu","password":"test1234","name":"Test Student","role":"student","rollNo":"999"}')
assert_contains "register works" "$NEW_USER" '"success":true'
assert_contains "duplicate register rejected" "$(req POST /api/auth/register '{"email":"test.student@student.edu","password":"x","name":"Dup","role":"student"}')" 'already exists'

say "Faculty CRUD"
FACULTY_LIST=$(req GET /api/faculty)
assert_contains "faculty list returns seed data" "$FACULTY_LIST" 'Sweta Choubey'
FACULTY_CREATE=$(req POST /api/faculty '{"name":"Dr. Test Faculty","email":"test.faculty@college.edu","department":"Testing"}')
assert_contains "faculty create works" "$FACULTY_CREATE" '"success":true'
FACULTY_ID=$(echo "$FACULTY_CREATE" | jq -r .faculty._id)
assert_contains "faculty duplicate email rejected" "$(req POST /api/faculty '{"name":"Dup","email":"test.faculty@college.edu","department":"X"}')" 'already exists'
FACULTY_SEARCH=$(req GET "/api/faculty?search=test.faculty&filterBy=name")
assert_contains "faculty search by name" "$FACULTY_SEARCH" 'Test Faculty'
DEPT_SEARCH=$(req GET "/api/faculty?search=Testing&filterBy=department")
assert_contains "faculty search by department" "$DEPT_SEARCH" 'Test Faculty'
FACULTY_GET=$(req GET "/api/faculty/$FACULTY_ID")
assert_contains "faculty get by id" "$FACULTY_GET" 'Dr. Test Faculty'
assert_contains "faculty update works" "$(req PUT "/api/faculty/$FACULTY_ID" '{"status":"leave"}')" '"status":"leave"'
assert_contains "faculty delete works" "$(req DELETE "/api/faculty/$FACULTY_ID")" 'deleted successfully'
assert_contains "faculty 404 after delete" "$(req GET "/api/faculty/$FACULTY_ID")" 'not found'

say "Classes CRUD"
CLASSES=$(req GET "/api/classes?teacherId=$TEACHER_ID")
assert_contains "teacher classes include Digital Circuits" "$CLASSES" 'Digital Circuits'
assert_contains "teacher classes include Embedded System" "$CLASSES" 'Embedded System'
CLASS1_ID=$(echo "$CLASSES" | jq -r '.classes[] | select(.name=="Digital Circuits") | ._id')
CLASS2_ID=$(echo "$CLASSES" | jq -r '.classes[] | select(.name=="Embedded System") | ._id')
CLASS_CREATE=$(req POST /api/classes "{\"name\":\"Test Subject\",\"teacherId\":\"$TEACHER_ID\"}")
assert_contains "class create works" "$CLASS_CREATE" '"success":true'
TEST_CLASS_ID=$(echo "$CLASS_CREATE" | jq -r .class._id)
assert_contains "duplicate class rejected" "$(req POST /api/classes "{\"name\":\"Test Subject\",\"teacherId\":\"$TEACHER_ID\"}")" 'already exists'
assert_contains "class rename works" "$(req PUT "/api/classes/$TEST_CLASS_ID" '{"name":"Test Subject Renamed"}')" 'Test Subject Renamed'
assert_contains "class get by id" "$(req GET "/api/classes/$CLASS1_ID")" 'Digital Circuits'

say "Students CRUD"
STUDENTS=$(req GET "/api/students?classId=$CLASS1_ID")
assert_contains "class roster returns students" "$STUDENTS" 'Nitish'
STUDENT_DOC_ID=$(echo "$STUDENTS" | jq -r '.students[] | select(.name=="Nitish") | ._id')
assert_contains "students by userId returns enrollments" "$(req GET "/api/students?userId=$STUDENT_ID")" 'Digital Circuits'
STUDENT_ADD=$(req POST /api/students "{\"classId\":\"$TEST_CLASS_ID\",\"name\":\"Test Kid\",\"rollNo\":55,\"email\":\"test.student@student.edu\"}")
assert_contains "student add works + links user account" "$STUDENT_ADD" 'test.student@student.edu'
TEST_STUDENT_ID=$(echo "$STUDENT_ADD" | jq -r .student._id)
TEST_USER_LOGIN=$(req POST /api/auth/login '{"email":"test.student@student.edu","password":"test1234","role":"student"}')
TEST_USER_ID=$(echo "$TEST_USER_LOGIN" | jq -r .user.id)
TEST_ROSTER=$(req GET "/api/students?classId=$TEST_CLASS_ID")
LINKED=$(echo "$TEST_ROSTER" | jq -r ".students[] | select(._id==\"$TEST_STUDENT_ID\") | .userId")
[ "$LINKED" = "$TEST_USER_ID" ] && ok "roster entry linked to user account" || bad "roster userId link expected $TEST_USER_ID, got: $LINKED"
assert_contains "duplicate rollNo rejected" "$(req POST /api/students "{\"classId\":\"$TEST_CLASS_ID\",\"name\":\"Dup\",\"rollNo\":55}")" 'already exists'
assert_contains "student update works" "$(req PUT "/api/students/$TEST_STUDENT_ID" '{"name":"Test Kid Jr"}')" 'Test Kid Jr'

say "Attendance marking"
# Add a second student so end-of-session logic covers absent marking
STUDENT_ADD2=$(req POST /api/students "{\"classId\":\"$TEST_CLASS_ID\",\"name\":\"Other Kid\",\"rollNo\":56}")
OTHER_STUDENT_ID=$(echo "$STUDENT_ADD2" | jq -r .student._id)

TODAY=$(date +%F)
MARK1=$(req POST /api/attendance "{\"classId\":\"$TEST_CLASS_ID\",\"date\":\"$TODAY\",\"attendanceData\":[{\"studentId\":\"$TEST_STUDENT_ID\",\"status\":\"Present\"}]}")
assert_contains "manual attendance mark works" "$MARK1" 'Attendance marked successfully'

# Verify stats: total=1, attended=1
S=$(req GET "/api/students?classId=$TEST_CLASS_ID")
S_CNT=$(echo "$S" | jq -r ".students[] | select(._id==\"$TEST_STUDENT_ID\") | \"\(.attended)/\(.total)\"")
assert_contains "student stats updated after mark (1/1)" "$S_CNT" '1/1'

# Re-mark same day as Absent — must NOT double count
req POST /api/attendance "{\"classId\":\"$TEST_CLASS_ID\",\"date\":\"$TODAY\",\"attendanceData\":[{\"studentId\":\"$TEST_STUDENT_ID\",\"status\":\"Absent\"}]}" >/dev/null
S=$(req GET "/api/students?classId=$TEST_CLASS_ID")
S_CNT=$(echo "$S" | jq -r ".students[] | select(._id==\"$TEST_STUDENT_ID\") | \"\(.attended)/\(.total)\"")
assert_contains "re-mark same day does not double count (0/1)" "$S_CNT" '0/1'

# Mark again as Present
req POST /api/attendance "{\"classId\":\"$TEST_CLASS_ID\",\"date\":\"$TODAY\",\"attendanceData\":[{\"studentId\":\"$TEST_STUDENT_ID\",\"status\":\"Present\"}]}" >/dev/null
S=$(req GET "/api/students?classId=$TEST_CLASS_ID")
S_CNT=$(echo "$S" | jq -r ".students[] | select(._id==\"$TEST_STUDENT_ID\") | \"\(.attended)/\(.total)\"")
assert_contains "flip back to Present keeps totals stable (1/1)" "$S_CNT" '1/1'

RECORDS=$(req GET "/api/attendance?classId=$TEST_CLASS_ID&date=$TODAY")
assert_contains "attendance record persisted" "$RECORDS" '"status":"Present"'
assert_contains "invalid status rejected" "$(req POST /api/attendance "{\"classId\":\"$TEST_CLASS_ID\",\"date\":\"$TODAY\",\"attendanceData\":[{\"studentId\":\"$TEST_STUDENT_ID\",\"status\":\"Whatever\"}]}")" 'Invalid status'

say "QR session flow"
SESSION_CREATE=$(req POST /api/sessions "{\"classId\":\"$TEST_CLASS_ID\",\"teacherId\":\"$TEACHER_ID\",\"duration\":60000}")
assert_contains "session create works" "$SESSION_CREATE" '"isActive":true'
SESSION_ID=$(echo "$SESSION_CREATE" | jq -r .session._id)

CHECKIN=$(req PUT "/api/sessions/$SESSION_ID" "{\"studentId\":\"$TEST_USER_ID\"}")
assert_contains "student check-in works" "$CHECKIN" 'Attendance marked successfully'

CHECKIN2=$(req PUT "/api/sessions/$SESSION_ID" "{\"studentId\":\"$TEST_USER_ID\"}")
assert_contains "duplicate check-in is idempotent" "$CHECKIN2" 'alreadyMarked'

# A student not enrolled in the class must be rejected
NOT_ENROLLED_LOGIN=$(req POST /api/auth/login '{"email":"tarun@student.edu","password":"password123","role":"student"}')
NOT_ENROLLED_ID=$(echo "$NOT_ENROLLED_LOGIN" | jq -r .user.id)
assert_contains "non-enrolled student rejected" "$(req PUT "/api/sessions/$SESSION_ID" "{\"studentId\":\"$NOT_ENROLLED_ID\"}")" 'not enrolled'

SESSION_GET=$(req GET "/api/sessions/$SESSION_ID")
assert_contains "session shows scanned students" "$SESSION_GET" 'Test Kid Jr'

# Make sure the check-in student actually got a Present record
CHECK_RECORD=$(req GET "/api/attendance?classId=$TEST_CLASS_ID&date=$TODAY")
assert_contains "check-in created Present record" "$CHECK_RECORD" '"status":"Present"'

SESSION_END=$(req PUT "/api/sessions/$SESSION_ID" '{"action":"end"}')
assert_contains "session end finalizes attendance" "$SESSION_END" 'attendance finalized'
END_PRESENT=$(echo "$SESSION_END" | jq -r .presentCount)
[ "$END_PRESENT" = "1" ] && ok "present count = 1 after end" || bad "present count expected 1, got: $END_PRESENT"

# Absent student should now have an Absent record; total incremented for both
S=$(req GET "/api/students?classId=$TEST_CLASS_ID")
OTHER_CNT=$(echo "$S" | jq -r ".students[] | select(._id==\"$OTHER_STUDENT_ID\") | \"\(.attended)/\(.total)\"")
assert_contains "absent student marked 0/1" "$OTHER_CNT" '0/1'

assert_contains "check-in on ended session rejected" "$(req PUT "/api/sessions/$SESSION_ID" "{\"studentId\":\"$TEST_USER_ID\"}")" 'ended'

say "Leave requests"
PRAKHAR_LOGIN=$(req POST /api/auth/login '{"email":"prakhar@student.edu","password":"password123","role":"student"}')
PRAKHAR_ID=$(echo "$PRAKHAR_LOGIN" | jq -r .user.id)
LEAVE_GET_STUDENT=$(req GET "/api/leave-requests?studentId=$PRAKHAR_ID")
assert_contains "student leave requests readable" "$LEAVE_GET_STUDENT" 'Medical check-up'
LEAVE_GET_TEACHER=$(req GET "/api/leave-requests?teacherId=$TEACHER_ID")
assert_contains "teacher sees seed leave requests" "$LEAVE_GET_TEACHER" 'Prakhar'
LEAVE_CREATE=$(req POST /api/leave-requests "{\"studentId\":\"$TEST_USER_ID\",\"studentName\":\"Test Kid Jr\",\"rollNo\":55,\"subject\":\"Test Subject Renamed\",\"date\":\"$TODAY\",\"reason\":\"API test\",\"classId\":\"$TEST_CLASS_ID\",\"teacherId\":\"$TEACHER_ID\"}")
assert_contains "leave request create works" "$LEAVE_CREATE" '"Pending"'
LEAVE_ID=$(echo "$LEAVE_CREATE" | jq -r .leaveRequest._id)
assert_contains "leave approve works" "$(req PUT "/api/leave-requests/$LEAVE_ID" '{"status":"Approved"}')" '"Approved"'
assert_contains "invalid leave status rejected" "$(req PUT "/api/leave-requests/$LEAVE_ID" '{"status":"Whatever"}')" 'Valid status'
assert_contains "leave delete works" "$(req DELETE "/api/leave-requests/$LEAVE_ID")" 'deleted successfully'

say "Classes / students cleanup (DELETE cascade)"
CLASS_DELETE=$(req DELETE "/api/classes/$TEST_CLASS_ID")
assert_contains "class delete works" "$CLASS_DELETE" 'deleted successfully'
assert_contains "roster cleared after class delete" "$(req GET "/api/students?classId=$TEST_CLASS_ID")" '"students":\[\]'

say "Page rendering"
for path in / /login /student /teacher /college /student/verify /college/add-faculty; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")
  if [ "$CODE" = "200" ] || [ "$CODE" = "307" ] || [ "$CODE" = "308" ]; then ok "GET $path -> $CODE"; else bad "GET $path -> $CODE"; fi
done

printf '\n\033[1mRESULTS: %d passed, %d failed\033[0m\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
