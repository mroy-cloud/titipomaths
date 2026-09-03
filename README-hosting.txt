TITIPO MATHS — hosting notes
=============================
Files in this folder:
  index.html            Title screen + Level 1 "Off & On"
  quarry.html           Level 2 "Quarry Times" (music + voices embedded)
  sw.js                 Offline cache (lets the Home Screen app work with no signal)
  manifest.webmanifest  App name/icon for "Add to Home Screen"
  icon-192.png, icon-512.png, apple-touch-icon.png

BEFORE UPLOADING: copy Level 1's sound files into this same folder:
  Game 1.mp3  Game 2.mp3  Game 3.mp3  Game 4.mp3  Game 5.mp3  Game 6.mp3  Yay - correct.mp3

1) DuckDNS
   - At duckdns.org create a subdomain (e.g. titipo.duckdns.org) pointing at your VPS IP.

The VPS has a single public IP that all your sites share. DuckDNS needs that IP so titipo.duckdns.org resolves to your server. To find it, run this on the VPS: curl -4 ifconfig.me. Paste the result into the "current ip" box for your subdomain on duckdns.org.

Nginx then tells the sites apart by name, not by IP. That is what the server_name titipo.duckdns.org; line in the config does: any request arriving for that hostname is routed to /var/www/titipo, and your other sites keep their own server_name blocks on the same port 80/443. Nothing in the Titipo config needs the IP.

Two cautions because you already have sites on this server. First, skip the README's sudo rm -f /etc/nginx/sites-enabled/default step unless you know nothing depends on it; it is only there for a fresh box. Second, make sure the Titipo block does not say default_server (mine does not), so it cannot hijack requests meant for your other sites. Certbot works per domain, so sudo certbot --nginx -d titipo.duckdns.org will only touch the Titipo block.

One thing to check: if your existing sites use a real domain rather than DuckDNS, the same IP in DuckDNS is still fine. Multiple hostnames pointing at one IP is the normal setup.

2) Upload (from a computer that has this folder):
   scp -r site/* USER@SERVER_IP:/tmp/titipo/
   then on the VPS:
   sudo mkdir -p /var/www/titipo && sudo cp -r /tmp/titipo/* /var/www/titipo/ && sudo chown -R www-data:www-data /var/www/titipo

3) Nginx site  (sudo nano /etc/nginx/sites-available/titipo)
   server {
       listen 80;
       server_name titipo.duckdns.org;
       root /var/www/titipo;
       index index.html;
       location / { try_files $uri $uri/ =404; }
       location = /sw.js { add_header Cache-Control "no-cache"; }
   }
   sudo ln -sf /etc/nginx/sites-available/titipo /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t && sudo systemctl reload nginx
   sudo ufw allow 80 && sudo ufw allow 443

4) Free HTTPS (needed for the offline Home Screen app)
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d titipo.duckdns.org
   (choose "redirect" when asked)

5) On the iPhone: open https://titipo.duckdns.org in Safari, tap Share -> Add to Home Screen.
   Open it once while online; after that it works offline.

Updating later: replace the files, then change CACHE = 'titipo-maths-v1' in sw.js to v2 (v3, ...)
so phones pick up the new version.
