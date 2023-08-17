# 🛡 NextAuth.js Shibboleth Provider

NextAuth.js provider for Shibboleth SSO through Cognito user pools.

## Installation

```sh
yarn add next-auth @osuresearch/shibboleth-provider
```

## Configuration

### Cognito Pool

At a minimum, the following user pool attributes should be mapped to SAML attributes:

|Pool Attribute
|---
|email
|name
|nickname
|username
|custom:affiliation
|custom:department
|custom:entitlements
|custom:idmid
|custom:osuid

For the appropriate SAML attributes or further help in configuring Cognito to talk to Shibboleth, contact OTDI.

### NextJS

If you are using NextJS with the app router you can add the following provider configuration to your `app/api/auth/[...nextauth]/route.ts` file:

```ts
import NextAuth from "next-auth";
import { ShibbolethProvider } from "@osuresearch/shibboleth-provider";

const handler = NextAuth({
  providers: [
    ShibbolethProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
    }),
  ],
});

export { handler as GET, handler as POST };
```

In the above example, `COGNITO_ISSUER` looks like the following:

```
https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/"
```

## Usage

This acts the same as all other NextAuth.js OAuth providers.

The user `image` automatically points to https://opic.osu.edu for their username.

We include a handful of extra fields on the user that come from Shibboleth:

| Field        | Example               |
| ------------ | --------------------- |
| nickname     | `"buckeye.1"`         |
| osuid        | `"200212345"`         |
| idmid        | `"IDM00012345"`       |
| affiliations | `["member", "staff"]` |
| department   | `"CC1234"`            |

For further information, check out the official documentation for securing your application: https://next-auth.js.org/getting-started/introduction
