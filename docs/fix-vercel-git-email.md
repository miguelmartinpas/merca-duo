# Fix: Vercel "Deployment Blocked" por email del commit

## Síntoma

> The deployment was blocked because the commit email `miguel.pastor@globant.com`
> could not be matched to a GitHub account.

## Causa

- El git **global** usa `miguel.pastor@globant.com` (`user.name = miguel-pastor_globant`).
- El repo **no tiene config local**, así que todos los commits salen con ese email.
- El remoto es la cuenta personal (`git@github.com-personal:miguelmartinpas/pomodoro.git`),
  y Vercel no encuentra ninguna cuenta de GitHub asociada al email de Globant.

Solución: sobreescribir el email **solo en este repo** (config local). El global no se toca.

## 1. Verificar estado actual

```bash
cd /Users/miguel.pastor/projects/pocs/ia/pomodoro
git config --global user.email   # miguel.pastor@globant.com (se queda así)
git config --local user.email    # vacío
```

## 2. Configurar el email solo en este repo

```bash
git config --local user.email "miguel.martinpastor@gmail.com"
git config --local user.name "miguelmartinpas"
```

> Aplicado en este repo: `user.name = miguelmartinpas` (usuario de GitHub) y
> `user.email = miguel.martinpastor@gmail.com`. El global sigue en
> `miguel-pastor_globant` / `miguel.pastor@globant.com`.

Comprobar:

```bash
git config --local --list | grep user
git config user.email   # debe mostrar miguel.martinpastor@gmail.com
```

> Requisito: ese email debe estar añadido y verificado en GitHub
> (Settings → Emails) en la cuenta `miguelmartinpas`.

## 3. Generar un commit con el email correcto

Vercel valida el **último commit** desplegado. Elige una opción:

### Opción A (recomendada): commit vacío nuevo

```bash
git commit --allow-empty -m "chore: trigger vercel deploy with correct author"
git push origin master
```

### Opción B: reescribir solo el último commit

```bash
git commit --amend --reset-author --no-edit
git push --force-with-lease origin master
```

### Opción C: reescribir todo el historial (solo si hace falta limpiar autoría)

```bash
git rebase -r --root --exec 'git commit --amend --reset-author --no-edit'
git push --force-with-lease origin master
```

> B y C reescriben historia y requieren force push. Úsalas solo si nadie más
> trabaja sobre `master`.

## 4. Verificar

```bash
git log -1 --format='%h %ae %an'
```

Debe mostrar `miguel.martinpastor@gmail.com`. Después, el push dispara un deploy
nuevo en Vercel sin el bloqueo.

## Revertir (por si acaso)

```bash
git config --local --unset user.email
git config --local --unset user.name
```
