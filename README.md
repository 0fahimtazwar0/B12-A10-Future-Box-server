# 📚 Book Haven

**Book Haven** is a full-stack digital library web application where book lovers can explore, add, manage, and review books — all in a beautifully crafted, immersive reading environment.

- 🌐 **Live Site:** [https://book-haven-fahim.web.app](https://book-haven-fahim.web.app)
- 🗄️ **Live Server:** [https://book-haven-server-steel.vercel.app](https://book-haven-server-steel.vercel.app)
##
- 📁 **Frontend Repo:** [https://github.com/0fahimtazwar0/B12-A10-Future-Box-client](https://github.com/0fahimtazwar0/B12-A10-Future-Box-client)
- 📁 **Backend Repo:** [https://github.com/0fahimtazwar0/B12-A10-Future-Box-server](https://github.com/0fahimtazwar0/B12-A10-Future-Box-server)

---
## 🔌 API Endpoints

The backend is built with **Node.js + Express.js**, secured with **Firebase Admin SDK** for token verification on all protected routes. Data is stored in **MongoDB Atlas**.

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/all-books` | ❌ | Fetch all books (summary & email fields excluded for performance) |
| `GET` | `/latest-books` | ❌ | Fetch the 6 most recently added books (used on homepage) |
| `GET` | `/my-books` | ✅ | Fetch only the books added by the currently authenticated user |
| `GET` | `/book-details/:id` | ✅ | Fetch full details of a single book by ID |
| `POST` | `/add-book` | ✅ | Add a new book to the database |
| `PATCH` | `/update-book/:id` | ✅ | Update specific fields of an existing book |
| `DELETE` | `/delete-book/:id` | ✅ | Delete a book by ID |
| `POST` | `/add-comment/:id` | ✅ | Push a new comment into a book's comments array |

### 🔒 Auth Strategy

Every protected route goes through a `verifyFirebaseToken` middleware that:
1. Reads the `Authorization: Bearer <token>` header from the request
2. Verifies the token using Firebase Admin SDK
3. Extracts the user's email from the decoded token and attaches it to the request — ensuring users can only interact with their own data on routes like `/my-books`
