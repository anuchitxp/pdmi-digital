# Deployment — Vultr instance, AlmaLinux 9

Runbook for hosting the app for testing on a Vultr instance running
AlmaLinux 9 (RHEL family). Works on the smallest instance size (1 vCPU /
1 GB RAM) for pilot-scale use.

> **PDPA / no-auth caution:** v1 has no login system. While on a public IP:
> use **only the fake seed data** (`H01-P-TEST-00x`), restrict port 3000 to
> your IP (or use Tailscale/WireGuard), and never load real patient records
> until the app runs inside the hospital network or behind auth.

## 1. Install Node 22 + tools

```bash
sudo dnf install -y curl git sqlite
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
```

## 2. Get the app running

```bash
git clone <your-repo-url> && cd pdmi-digital
npm ci
npx prisma migrate dev      # creates SQLite DB + seeds fake demo patients
npm run build
```

**SELinux note:** AlmaLinux enforces SELinux by default. Running from a home
directory (e.g. `/home/user/pdmi-digital`) needs no changes; only if you place
the app under `/srv` or `/opt` behind a reverse proxy would you need to fix
file contexts (`semanage fcontext` / `restorecon`).

## 3. Keep it running (pm2)

```bash
sudo npm i -g pm2
pm2 start npm --name pdmi -- start
pm2 save
pm2 startup        # then run the command it prints, with sudo
```

pm2 will now restart the app on crashes and on reboot.

## 4. Firewall — two layers

**Firewalld (on the instance)** — allow port 3000 from your IP only:

```bash
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="<YOUR-IP>" port port="3000" protocol="tcp" accept'
sudo firewall-cmd --reload
```

**Vultr Cloud → Firewall** — attach a firewall group to the instance with a
rule allowing TCP 3000 from your IP only. (Without this, the instance-level
rule alone is not enough if a Vultr firewall group is attached.)

## 5. Verify

Open `http://<instance-ip>:3000` — the dashboard should show the 4
`H01-P-TEST-00x` demo patients.

## 6. Daily backup

```bash
chmod +x scripts/backup-db.sh
crontab -e
# add:
# 0 2 * * * cd ~/pdmi-digital && ./scripts/backup-db.sh ~/pdmi-backups
```

Restore instructions are in the README ("Backup & restore").

## Updating

```bash
cd ~/pdmi-digital
git pull
npm ci
npx prisma migrate dev
npm run build
pm2 restart pdmi
```
