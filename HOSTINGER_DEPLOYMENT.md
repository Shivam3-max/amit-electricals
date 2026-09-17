# Hostinger Business deployment

This project is configured for Hostinger's managed **Node.js Web App** hosting
and its included MySQL database. Deploy it through GitHub so later pushes can
be redeployed from hPanel.

## 1. Create the MySQL database

In hPanel, open **Databases → Management** and create a database and user.
Keep the generated database name, username, and password.

The application expects one connection string:

```text
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME
```

Percent-encode reserved characters in the username or password. For example,
`@` becomes `%40`, `#` becomes `%23`, and `/` becomes `%2F`.

## 2. Add the Node.js web app

1. Open **Websites → Add Website → Deploy Web App**.
2. Choose **Import Git Repository** and select this repository's `main` branch.
3. Choose the generated **temporary domain** when hPanel asks for a domain.
4. Use the deployment settings below.

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Node.js | 22.x |
| Root directory | `.` |
| Install command | `npm install` (or Hostinger's detected default) |
| Build command | `npm run build` |
| Start command | `npm start` |
| Output directory | `.next` if hPanel asks; otherwise leave auto-detected |
| Port | `3000` |

## 3. Environment variables

Add these in the deployment form. Do not upload or commit a real `.env` file.

```text
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME
ADMIN_PASSWORD=use-a-long-unique-password
NODE_ENV=production
```

`npm run build` automatically generates the Prisma client, applies the MySQL
migrations, rebuilds the product catalog with saved overrides, and builds
Next.js. No manual SQL import or SSH command is required.

## 4. Verify the temporary deployment

After hPanel reports a successful deployment, check:

- `/` loads the storefront.
- `/admin/login` accepts `ADMIN_PASSWORD`.
- `/account/register` can create a dealer account.
- `/contact` can save a message.
- Upload an admin banner and confirm it still loads after a restart.

Product edits are saved immediately to MySQL but are added to the storefront's
static catalog on the next **Redeploy**. Homepage banners, department artwork,
FAQs, enquiries, dealer accounts, and messages are database-backed and do not
need a catalog rebuild.

## 5. Connect the final domain later

From the temporary website's dashboard, choose **Connect domain**, enter the
final domain, and follow hPanel's DNS instructions. Hostinger provisions SSL
automatically after the DNS change resolves.
