# Deploy no GitHub Pages – Passos Rápidos

## 1️⃣ Criar Repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Nome do repositório: `pa01-coleta`
3. Descrição: "Sistema PWA para coleta de relatorios PA01"
4. Escolha **Public** (para funcionar em GitHub Pages)
5. Clique **Create repository**

## 2️⃣ Clonar e Preparar Localmente

```bash
# Clonar repositório vazio
git clone https://github.com/SEU-USUARIO/pa01-coleta.git
cd pa01-coleta

# Copiar todos os arquivos do projeto para esta pasta
# (Mantenha index.html na raiz, js/, icons/, etc.)

# Ver estrutura
ls -la
# Deve ter: index.html, manifest.webmanifest, sw.js, js/, icons/, README.md
```

## 3️⃣ Fazer Commit e Push

```bash
# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Versão inicial PWA PA01 + BLE"

# Enviar para GitHub
git push -u origin main
```

## 4️⃣ Habilitar GitHub Pages

1. Abra seu repositório no GitHub.
2. Vá até **Settings → Pages**.
3. Em **Branch**, selecione `main`.
4. Em **Folder**, escolha `/ (root)`.
5. Clique **Save**.

GitHub vai processar em ~1 minuto. Sua URL será:
```
https://seu-usuario.github.io/pa01-coleta
```

## 5️⃣ Validar Funcionamento

1. Abra a URL acima no navegador.
2. Pressione **F12** e vá até a aba **Application**.
3. Procure por **Service Workers** — deve estar registrado.
4. Procure por **Manifest** — deve estar carregado.
5. Teste a instalação no seu navegador.

## 6️⃣ Enviar Link ao Cliente

```
Clique aqui para acessar o sistema PA01:
https://seu-usuario.github.io/pa01-coleta

Para instalar como app:
- Chrome/Edge: clique no ícone de instalar na barra
- Android: Menu → Adicionar à Tela Inicial
- iPhone: Compartilhar → Adicionar à Tela de Início

Navegador recomendado: Chrome ou Edge
```

---

## 🚀 Atualizações Futuras

Sempre que fizer mudanças:

```bash
# Edite os arquivos localmente
# Depois:

git add .
git commit -m "Descrição da mudança"
git push origin main
```

GitHub Pages redeploy automaticamente em ~1 minuto. Limpe cache do navegador (Ctrl+Shift+Del) se não ver mudanças.

---

## ⚙️ Configurações Recomendadas (Opcional)

### Domínio Customizado
Se quiser usar seu próprio domínio (ex: `pa01.seudominio.com`):
1. Settings → Pages → Custom domain
2. Digite seu domínio
3. Configure DNS da sua registradora

### Proteção de Branch
Para evitar commits diretos acidentais:
1. Settings → Branches
2. Add rule para `main`
3. Ative "Require pull request reviews"

---

**Dúvidas? Verifique o status em:** Settings → Pages (mostra URL e status do deploy)
