# Dokploy image for the OLD docs hosts (takeoff-v2.app.turkishtechlab.com and
# spar.app.turkishtechlab.com). The docs site itself is served from AWS
# (infra/, .github/workflows/deploy-docs.yml); this image only answers the old
# hosts with permanent redirects so existing links and search results keep
# working. Delete it, and the Dokploy app, once traffic to the old hosts dies out.
FROM nginx:1.31-alpine

COPY infra/legacy-redirect.nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]
