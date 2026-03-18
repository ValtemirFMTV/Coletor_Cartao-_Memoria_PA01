export class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.btnInstalar = null;
    this.modalInstalar = null;
    this.isInstalled = false;

    this.init();
  }

  init() {
    this.btnInstalar = document.getElementById('btnInstalar');
    this.modalInstalar = document.getElementById('modalInstalar');

    if (!this.btnInstalar || !this.modalInstalar) {
      return;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.mostrarBotaoInstalar();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.btnInstalar.style.display = 'none';
      console.log('PWA instalado com sucesso!');
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      this.btnInstalar.style.display = 'none';
    }

    this.btnInstalar.addEventListener('click', () => this.processoInstalar());

    const fecharModal = document.getElementById('fecharModal');
    if (fecharModal) {
      fecharModal.addEventListener('click', () => this.fecharModal());
    }

    this.mostrarInstrucoesPlataforma();
  }

  mostrarBotaoInstalar() {
    if (this.btnInstalar) {
      this.btnInstalar.style.display = 'block';
    }
  }

  async processoInstalar() {
    if (!this.deferredPrompt) {
      this.abrirModalInstrucoes();
      return;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log('Usuário respondeu:', outcome);

    this.deferredPrompt = null;
  }

  abrirModalInstrucoes() {
    if (this.modalInstalar) {
      this.modalInstalar.style.display = 'flex';
    }
  }

  fecharModal() {
    if (this.modalInstalar) {
      this.modalInstalar.style.display = 'none';
    }
  }

  mostrarInstrucoesPlataforma() {
    const ua = navigator.userAgent.toLowerCase();
    const isChrome = /chrome/.test(ua) && !/edg/.test(ua);
    const isEdge = /edg/.test(ua);
    const isAndroid = /android/.test(ua);
    const isIPhone = /iphone|ipad|ipod/.test(ua);
    const isFirefox = /firefox/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|edg/.test(ua);

    let instrucoes = '';

    if (isAndroid && (isChrome || isEdge)) {
      instrucoes = '📱 <strong>Android Chrome/Edge:</strong> Menu ≡ → Adicionar à Tela Inicial';
    } else if (isIPhone || isIPhone) {
      instrucoes = '📱 <strong>iPhone/iPad:</strong> Compartilhar ⤴ → Adicionar à Tela de Início';
    } else if (isChrome) {
      instrucoes = '🖥️ <strong>Desktop Chrome:</strong> Clique no ícone de instalar na barra de endereço';
    } else if (isEdge) {
      instrucoes = '🖥️ <strong>Desktop Edge:</strong> Clique no ícone de instalar na barra de endereço';
    } else if (isFirefox) {
      instrucoes = '⚠️ <strong>Firefox:</strong> Instalar como app não é nativo. Use Chrome/Edge ou adicione marcador.';
    } else if (isSafari) {
      instrucoes = '⚠️ <strong>Safari:</strong> Instalar como app não é nativo. Use iPhone ou Chrome alternativo.';
    }

    const detalheInstalar = document.getElementById('detalheInstalar');
    if (detalheInstalar && instrucoes) {
      detalheInstalar.innerHTML = instrucoes;
    }
  }
}

export default PWAInstaller;
