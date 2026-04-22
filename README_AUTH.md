# Authentication changes — file placement

## Java backend files

All go under `document-versioning/src/main/java/com/docvcs/...`

| File | Goes in | Action |
|---|---|---|
| `PasswordHasher.java` | `auth/` (create new folder) | **NEW** |
| `RegisterRequest.java` | `dto/` | **NEW** |
| `UserService.java` | `service/` | **REPLACE** |
| `AuthController.java` | `controler/` | **REPLACE** |

After placing the files, the Java package tree should look like:

```
src/main/java/com/docvcs/
├── auth/
│   └── PasswordHasher.java              ← NEW
├── config/AppConfig.java                  (unchanged)
├── controler/
│   ├── AuthController.java              ← REPLACE
│   ├── DocumentController.java            (unchanged)
│   └── UserController.java                (unchanged)
├── dto/
│   ├── CreateDocumentRequest.java         (unchanged)
│   ├── CreateUserRequest.java             (unchanged)
│   ├── ErrorResponse.java                 (unchanged)
│   ├── LoginRequest.java                  (unchanged)
│   ├── LoginResponse.java                 (unchanged)
│   └── RegisterRequest.java             ← NEW
├── exception/                             (unchanged)
├── model/                                 (unchanged)
├── server/                                (unchanged — socket server still fine)
├── service/
│   ├── DocumentService.java               (unchanged)
│   └── UserService.java                 ← REPLACE
├── storage/                               (unchanged)
├── client/                                (unchanged)
├── gui/                                   (unchanged)
└── Main.java                              (unchanged)
```

## React frontend files

All go under `my-app/src/...`

| File | Goes in | Action |
|---|---|---|
| `api.js` | `services/` | **REPLACE** |
| `ProtectedRoute.jsx` | `components/` | **NEW** |
| `Layout.jsx` | `components/` | **REPLACE** |
| `SignUp.jsx` | `pages/out/` | **REPLACE** |
| `App.jsx` | `src/` | **REPLACE** |

After placing the files, the React tree should look like:

```
my-app/src/
├── App.jsx                                ← REPLACE
├── components/
│   ├── CustomSelect.jsx                   (unchanged)
│   ├── Layout.jsx                       ← REPLACE
│   └── ProtectedRoute.jsx               ← NEW
├── pages/
│   ├── out/
│   │   ├── Login.jsx                      (unchanged)
│   │   ├── SignUp.jsx                   ← REPLACE
│   │   └── Help.jsx                       (unchanged)
│   ├── layout/                            (unchanged)
│   └── account/                           (unchanged)
└── services/
    └── api.js                           ← REPLACE
```

---

## What changed in each file, short version

**PasswordHasher.java** — new utility class. SHA-256 + salt, with backward compatibility for existing plaintext passwords (they get rehashed on first successful login).

**UserService.java** — `login()` now verifies hashed passwords; added `register()` that creates non-admin users with hashed passwords; default admin is created with a hash instead of plaintext.

**RegisterRequest.java** — new DTO matching the JSON that SignUp sends: `{username, email, password, role}`.

**AuthController.java** — added `POST /api/auth/register`. Login endpoint is unchanged.

**api.js** — added `registerUser(username, email, password, role)`. Everything else is identical.

**SignUp.jsx** — actually calls `registerUser()` now instead of just showing "Account created successfully!". On success, stores session in the same `localStorage` keys that Login uses (`user`, `username`, `role`), then navigates to `/dashboard`.

**ProtectedRoute.jsx** — new component. Redirects to `/` if `localStorage.username` is missing. Supports optional `roles={["ADMIN"]}` prop.

**App.jsx** — wraps the `<Layout />` route in `<ProtectedRoute>`; wraps the `/users` route in an additional ADMIN-only check.

**Layout.jsx** — logout now clears all three localStorage keys (previously only `role`); avatar shows first letter of logged-in username instead of always "A".

---

## How to test after placing files

1. **Backend: just run `Main.java`** as before (IntelliJ / `mvn spring-boot:run`). Spring should come up on port 8080.

2. **First login with existing admin** — `admin / admin123` still works. After this login, open `data/users.json` — the admin's password field should now look like `sha256$...$...` instead of plaintext. That's the lazy migration working.

3. **Sign up a new user** — go to `/signup`, use password like `Test@1234`, pick any role. You should land in `/dashboard` as the new user. Check `users.json` — new user is there with hashed password.

4. **Try accessing `/dashboard` without logging in** — open an incognito window, type `http://localhost:5173/dashboard`. You should get bounced to `/`.

5. **Logout** — click logout from dropdown, verify you go to login and all three localStorage keys are gone.

6. **ADMIN-only route** — login as a non-admin user, try typing `/users` in the URL. You should get bounced to `/dashboard`.

---

## Known limitations (unchanged — same as before)

- `requesterUsername` is passed as a query parameter to other endpoints (users, documents). Anyone can spoof it. This isn't real authentication on those endpoints — but that was the existing design, and fixing it means touching every controller. Left as-is.
- Sessions live only in `localStorage`. Clearing browser storage = logged out. That's fine for a project.
- SHA-256 is weaker than BCrypt. Adequate for the assignment, not for production.
