# Cloudflare Configuration Guide — MTC Group

This guide walks through setting up Cloudflare in front of the AWS ALB/CloudFront for `mtc-groups.com`. Cloudflare provides an additional layer of DDoS protection, WAF rules, and global CDN on top of what AWS already provides.

---

## Prerequisites

- A Cloudflare account with the `mtc-groups.com` domain added
- The ALB DNS name from Terraform output (`alb_dns_name`)  
  OR the CloudFront domain (`cloudfront_domain`) — prefer CloudFront
- SSL/TLS certificate already issued in ACM

---

## Step 1 — Add Domain to Cloudflare

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Add a Site** → enter `mtc-groups.com` → choose plan (Business or Enterprise for WAF)
3. Cloudflare will scan existing DNS records — review them
4. Update your domain registrar's nameservers to the Cloudflare-provided NS records
5. Wait for propagation (typically < 1 hour)

---

## Step 2 — DNS Records

Add these records in **Cloudflare DNS**. Set proxy status to **Proxied** (orange cloud) on all records so traffic flows through Cloudflare.

| Type  | Name               | Content (Value)                        | Proxy  | TTL  |
|-------|--------------------|----------------------------------------|--------|------|
| A     | `@`                | Point to CloudFront IP (see note)      | Yes    | Auto |
| CNAME | `www`              | `mtc-groups.com`                       | Yes    | Auto |
| CNAME | `api`              | `<cloudfront_domain>.cloudfront.net`   | Yes    | Auto |

> **Note on A record for CloudFront**: CloudFront does not provide a stable IP. Use a CNAME flattening approach:  
> Set the root `@` record as **CNAME** to `<cloudfront_domain>.cloudfront.net` — Cloudflare supports CNAME at the apex via CNAME flattening automatically.

---

## Step 3 — SSL/TLS Settings

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full (strict)**  
   *(The ALB/CloudFront already has a valid ACM certificate — Full strict verifies it)*
3. Enable **Always Use HTTPS**
4. Enable **HSTS** (under SSL/TLS → Edge Certificates):
   - Max Age: 6 months minimum (31536000 seconds for production)
   - Include subdomains: Yes
   - Preload: Yes (only after testing)
5. Set **Minimum TLS Version** to TLS 1.2

---

## Step 4 — Page Rules (Legacy) / Rules (New)

Using the new **Rules** engine (preferred over Page Rules):

### Rule 1 — Force HTTPS on all traffic
- **Match**: `http://mtc-groups.com/*`
- **Action**: Redirect to HTTPS (301)

### Rule 2 — Cache static assets
- **Match**: `mtc-groups.com/*.{js,css,png,jpg,jpeg,gif,svg,woff2,woff,ttf,ico}`
- **Action**: Cache Level = Cache Everything, Edge Cache TTL = 1 month

### Rule 3 — Bypass cache for API and portal
- **Match**: `mtc-groups.com/api/*` or `mtc-groups.com/portal/*`
- **Action**: Cache Level = Bypass

---

## Step 5 — WAF Rules

Navigate to **Security → WAF → Custom Rules**:

### Rule 1 — Block bad bots
- **Expression**: `(cf.client.bot) and not (cf.verified_bot_category in {"Search Engine Crawlers" "Monitoring & Analytics"})`
- **Action**: Block

### Rule 2 — Rate-limit login endpoints
- **Type**: Rate Limiting Rule
- **Expression**: `http.request.uri.path contains "/api/auth"` OR `http.request.uri.path contains "/portal/login"`
- **Rate**: 10 requests per minute per IP
- **Action**: Block (for 1 minute)

### Rule 3 — Country allowlist (optional)
If MTC operations are region-specific, restrict by country:
- **Expression**: `not (ip.geoip.country in {"AE" "QA" "SA" "KW" "BH" "OM" "GB" "US"})`
- **Action**: Block or Challenge

### Managed Rulesets
Enable under **Security → WAF → Managed Rules**:
- **Cloudflare Managed Ruleset** — On (sensitivity: Medium)
- **Cloudflare OWASP Core Ruleset** — On (Paranoia Level 2, score threshold: Medium)

---

## Step 6 — DDoS Protection

1. Go to **Security → DDoS**
2. HTTP DDoS attack protection: **High**
3. Network-layer DDoS: enabled by default on all plans

---

## Step 7 — Security Headers (via Transform Rules)

Add response headers via **Rules → Transform Rules → Modify Response Header**:

| Header                        | Value                                                         |
|-------------------------------|---------------------------------------------------------------|
| `Strict-Transport-Security`   | `max-age=31536000; includeSubDomains; preload`               |
| `X-Content-Type-Options`      | `nosniff`                                                     |
| `X-Frame-Options`             | `SAMEORIGIN`                                                  |
| `Referrer-Policy`             | `strict-origin-when-cross-origin`                            |
| `Permissions-Policy`          | `camera=(), microphone=(), geolocation=()`                   |

*(These are also set in nginx.conf but Cloudflare ensures they're applied even for cached responses.)*

---

## Step 8 — Verify

```bash
# Check DNS propagation
dig mtc-groups.com +short

# Verify Cloudflare proxy is active (should show Cloudflare IPs, not AWS)
curl -sI https://mtc-groups.com | grep -i "cf-ray\|server"

# Check security headers
curl -sI https://mtc-groups.com | grep -iE "strict-transport|x-frame|x-content"

# Test API endpoint
curl -s https://mtc-groups.com/api/healthz
```

---

## Rollback

If Cloudflare causes issues, temporarily set all DNS records to **DNS only** (grey cloud) to bypass Cloudflare and route directly to CloudFront/ALB. This takes effect within seconds.
