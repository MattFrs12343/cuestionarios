set -eu
umask 077
s="$HOME/tmp/cuestionarios-forms-1117/release"
p="$HOME/cuestionarios.examenes-neuro.com"
b=$(mktemp -d "$HOME/deploy_backups/cuestionarios.XXXXXX")
echo "Backup: $b"
cd "$s"
find . -type f | sort > "$b/all"
while IFS= read -r f; do if test -f "$p/$f"; then printf '%s\n' "$f"; fi; done < "$b/all" > "$b/existing"
comm -23 "$b/all" "$b/existing" > "$b/new"
cd "$p"
tar -cf "$b/files.tar" -T "$b/existing"
php artisan down --retry=30
rollback() {
  tar -xf "$b/files.tar" -C "$p"
  while IFS= read -r f; do rm -f -- "$p/$f"; done < "$b/new"
  php artisan route:clear
  php artisan view:clear
  php artisan up
}
trap rollback EXIT
rsync -rp --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r "$s/" "$p/"
php artisan route:clear
php artisan view:clear
set --
for f in "$s"/database/migrations/*.php; do set -- "$@" "--path=database/migrations/${f##*/}"; done
php artisan migrate --force "$@"
php artisan route:list --path=questionnaires --no-ansi > "$b/routes.json"
for m in barre finger-tapping mingazzini; do grep -q "questionnaires/$m" "$b/routes.json"; done
if grep -Eq 'questionnaires/(epley|raimiste|wartenberg)' "$b/routes.json"; then exit 1; fi
php artisan up
curl -fsS --max-time 15 https://cuestionarios.examenes-neuro.com/login -o "$b/login.html"
grep -q '/build/assets/' "$b/login.html"
curl -fsS --max-time 15 https://cuestionarios.examenes-neuro.com/build/assets/app-B4c_koSb.js -o /dev/null
curl -fsS --max-time 15 https://cuestionarios.examenes-neuro.com/build/assets/app-B_rlWC-D.css -o /dev/null
grep -q app-B4c_koSb.js "/login.html"
trap - EXIT
echo DEPLOY_OK
