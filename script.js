
    const $ = (s, root=document) => root.querySelector(s);
    const $$ = (s, root=document) => [...root.querySelectorAll(s)];
    $('#year').textContent = new Date().getFullYear();

    // Menu responsivo
    const menuToggle = $('#menuToggle'), navlinks = $('#navlinks');
    menuToggle.addEventListener('click', () => {
      const open = navlinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.textContent = open ? '×' : '☰';
    });
    $$('#navlinks a').forEach(link => link.addEventListener('click', () => {
      navlinks.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); menuToggle.textContent='☰';
    }));

    // Filtro de projetos
    $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyProjectFilters();
    }));


    // Busca em tempo real e favoritos persistentes no navegador
    const searchInput = $('#projectSearch');
    const favoritesToggle = $('#favoritesToggle');
    const favoritesCount = $('#favoritesCount');
    const favoriteStorageKey = 'atelieLumeFavorites';
    let favorites = new Set();
    try { favorites = new Set(JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]')); } catch { favorites = new Set(); }
    let activeFilter = 'todos';
    let favoritesOnly = false;
    const projectCards = $$('.project');
    const projectGrid = $('#projectGrid');
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-projects';
    emptyState.textContent = 'Nenhum projeto encontrado. Experimente outra busca ou categoria.';
    emptyState.hidden = true;
    projectGrid.append(emptyState);

    function updateFavoriteButtons() {
      projectCards.forEach((project, index) => {
        const key = project.dataset.title || String(index);
        const button = $('.favorite-btn', project);
        const saved = favorites.has(key);
        if (button) {
          button.setAttribute('aria-pressed', String(saved));
          button.innerHTML = saved ? '♥' : '♡';
          button.setAttribute('aria-label', saved ? 'Remover dos favoritos' : 'Salvar projeto nos favoritos');
        }
      });
      favoritesCount.textContent = String(favorites.size);
      try { localStorage.setItem(favoriteStorageKey, JSON.stringify([...favorites])); } catch {}
    }

    function applyProjectFilters() {
      const query = (searchInput?.value || '').trim().toLocaleLowerCase('pt-BR');
      let visibleCount = 0;
      projectCards.forEach(project => {
        const matchesCategory = activeFilter === 'todos' || project.dataset.category === activeFilter;
        const searchable = [project.dataset.title, project.dataset.location, project.dataset.desc, project.textContent].join(' ').toLocaleLowerCase('pt-BR');
        const matchesSearch = !query || searchable.includes(query);
        const matchesFavorite = !favoritesOnly || favorites.has(project.dataset.title);
        const visible = matchesCategory && matchesSearch && matchesFavorite;
        project.hidden = !visible;
        if (visible) visibleCount++;
      });
      emptyState.hidden = visibleCount > 0;
    }

    searchInput?.addEventListener('input', applyProjectFilters);
    favoritesToggle?.addEventListener('click', () => {
      favoritesOnly = !favoritesOnly;
      favoritesToggle.setAttribute('aria-pressed', String(favoritesOnly));
      favoritesToggle.innerHTML = `${favoritesOnly ? '♥' : '♡'} Favoritos <span id="favoritesCount">${favorites.size}</span>`;
      applyProjectFilters();
    });
    projectCards.forEach((project, index) => {
      const button = $('.favorite-btn', project);
      if (!button) return;
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const key = project.dataset.title || String(index);
        favorites.has(key) ? favorites.delete(key) : favorites.add(key);
        updateFavoriteButtons();
        applyProjectFilters();
      });
    });
    updateFavoriteButtons();

        // Modal de detalhes de cada projeto
    const modal = $('#projectModal');
    $$('.project').forEach(project => project.addEventListener('click', () => {
      $('#modalImage').src = project.dataset.image;
      $('#modalImage').alt = project.dataset.title;
      $('#modalTitle').textContent = project.dataset.title;
      $('#modalLocation').textContent = project.dataset.location + ' · ' + project.dataset.year;
      $('#modalDesc').textContent = project.dataset.desc;
      modal.classList.add('open'); document.body.style.overflow='hidden'; $('#modalClose').focus();
    }));
    function closeModal(){modal.classList.remove('open');document.body.style.overflow='';}
    $('#modalClose').addEventListener('click', closeModal);
    modal.addEventListener('click', e => {if(e.target===modal) closeModal();});
    document.addEventListener('keydown', e => {if(e.key==='Escape') closeModal();});
    $('#modalContact').addEventListener('click', closeModal);

    // Formulário: abre o aplicativo de e-mail com a mensagem preenchida.
    $('#contactForm').addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const name = data.get('name'), email = data.get('email'), type = data.get('projectType'), meeting = data.get('meeting'), message = data.get('message') || 'Ainda não detalhado.';
      const recipient = '[seuemail@email.com]'; // Troque pelo seu e-mail antes de publicar.
      const subject = encodeURIComponent('Pedido de reunião — ' + name);
      const body = encodeURIComponent(`Olá! Meu nome é ${name}.\nE-mail: ${email}\nTipo de projeto: ${type}\nPreferência de reunião: ${meeting}\n\nSobre a ideia:\n${message}\n\nPodemos agendar uma conversa?`);
      $('#formMessage').style.display = 'block';
      if(recipient.includes('[')){
        $('#formMessage').textContent = 'O formulário está pronto! Para receber os pedidos, substitua [seuemail@email.com] pelo seu e-mail no código. Depois, o botão abrirá uma mensagem pronta para envio.';
        $('#toast').textContent = 'Personalize o e-mail no código antes de publicar.'; $('#toast').classList.add('show'); setTimeout(()=>$('#toast').classList.remove('show'),4000);
      } else {
        window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
        $('#formMessage').textContent = 'Seu aplicativo de e-mail deve abrir com a mensagem preenchida. Confira os dados e envie!';
      }
    });

    // Animações suaves ao rolar
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
    }), {threshold:.12});
    $$('.reveal').forEach(el => observer.observe(el));

    // Cursor divertido em telas grandes
    const orb = $('#cursorOrb');
    window.addEventListener('mousemove', e => {orb.style.left=e.clientX+'px';orb.style.top=e.clientY+'px';});
    $$('a,button,.project').forEach(el => {
      el.addEventListener('mouseenter',()=>{orb.style.width='34px';orb.style.height='34px';});
      el.addEventListener('mouseleave',()=>{orb.style.width='18px';orb.style.height='18px';});
    });
  