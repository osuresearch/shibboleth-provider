import { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

export interface ShibbolethProfile extends Record<string, any> {
  sub: string;

  osuid: string;
  idmid: string;

  name: string;
  nickname: string;
  email: string;

  affiliations: string[];
  department: string;

  /** opic.osu.edu avatar */
  image: string;
}

export interface ShibbolethConfig<P extends ShibbolethProfile>
  extends OAuthConfig<P> {}

export interface ShibbolethUserConfig<P extends ShibbolethProfile>
  extends OAuthUserConfig<P> {}

/**
 * Custom provider for a Cognito user pool connected to the Shibboleth SSO
 *
 * The builtin Cognito driver will strip out additional attributes
 * provided by Shibboleth, so this replacement adapter checks for
 * and exposes those attributes to the client.
 *
 * @param options
 * @returns
 */
export function ShibbolethProvider<P extends ShibbolethProfile>(
  options: ShibbolethUserConfig<P>
): ShibbolethConfig<P> {
  if (!options.issuer) {
    throw new Error("Expected issuer");
  }

  return {
    id: "shibboleth",
    name: "Shibboleth",
    type: "oauth",
    wellKnown: `${options.issuer}/.well-known/openid-configuration`,
    idToken: true,

    // Workaround for potential failure for Cognito + external IdPs.
    // See: https://github.com/nextauthjs/next-auth/discussions/3551
    checks: "nonce",

    profile(profile: any) {
      return {
        id: profile.sub,

        osuid: profile["custom:osuid"] as string,
        idmid: profile["custom:idmid"] as string,

        name: profile.name,
        email: profile.email,
        image: `https://opic.osu.edu/${profile.email}?width=${128}`,

        nickname: profile.nickname,

        affiliations: parseAffiliation(profile["custom:affiliation"] as string),
        department: profile["custom:department"] as string,
      };
    },
    style: {
      logo: "/cognito.svg",
      logoDark: "/cognito.svg",
      bg: "#fff",
      text: "#C17B9E",
      bgDark: "#fff",
      textDark: "#C17B9E",
    },
    options,
  };
}

/**
 * Convert an encoded OSU affiliate string to an array of affiliation keys.
 *
 * @param value Encoded JSON value, e.g.`"[member%40osu.edu,staff%40@osu.edu]""`
 *
 * @returns array of affiliations. E.g. `["member", "staff", "employee"]`
 */
function parseAffiliation(value: string): string[] {
  return value
    .substring(1, value.length - 1)
    .replaceAll("%40osu.edu", "")
    .split(",")
    .map((a) => a.trim());
}
