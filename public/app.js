/* Leatherbound Notebook — client logic
   Two-page spread edition: pages[] are paired into spreads (left/right),
   page turns try a WebGL (three.js) leaf-turn first and fall back to a
   plain CSS 3D rotation if WebGL isn't available or anything throws.

   New in this version:
   - Images uploaded to server (data/images/), not stored as base64
   - Inline image overlay: click an image to resize, move, or delete it
   - Polished live URL cards with title + thumbnail + domain badge
*/
(function () {
  'use strict';

  // ---------- element references ----------
  const lockScreen = document.getElementById('lockScreen');
  const lockCard = document.querySelector('.lock-card');
  const lockTitle = document.getElementById('lockTitle');
  const lockSubtitle = document.getElementById('lockSubtitle');
  const lockBookCountBadge = document.getElementById('lockBookCountBadge');
  const lockBookCountText = document.getElementById('lockBookCountText');
  const tabAllNotebooks = document.getElementById('tabAllNotebooks');
  const tabLogin = document.getElementById('tabLogin');
  const tabCreateUser = document.getElementById('tabCreateUser');
  const viewAllNotebooks = document.getElementById('viewAllNotebooks');
  const viewLogin = document.getElementById('viewLogin');
  const viewCreateUser = document.getElementById('viewCreateUser');
  const lockNotebooksList = document.getElementById('lockNotebooksList');
  const shelfCreateBtn = document.getElementById('shelfCreateBtn');
  const selectedNotebookBanner = document.getElementById('selectedNotebookBanner');
  const bannerSpine = document.getElementById('bannerSpine');
  const selectedNotebookTitle = document.getElementById('selectedNotebookTitle');
  const selectedNotebookOwner = document.getElementById('selectedNotebookOwner');
  const clearSelectedNotebookBtn = document.getElementById('clearSelectedNotebookBtn');
  const lockForm = document.getElementById('lockForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const confirmField = document.getElementById('confirmField');
  const confirmInput = document.getElementById('confirmInput');
  const lockSubmit = document.getElementById('lockSubmit');
  const lockError = document.getElementById('lockError');
  const clasp = document.getElementById('clasp');

  const createUserForm = document.getElementById('createUserForm');
  const createUsernameInput = document.getElementById('createUsernameInput');
  const createNotebookTitleInput = document.getElementById('createNotebookTitleInput');
  const createPasswordInput = document.getElementById('createPasswordInput');
  const createConfirmPasswordInput = document.getElementById('createConfirmPasswordInput');
  const toggleShowAllPasswords = document.getElementById('toggleShowAllPasswords');
  const createUserSubmit = document.getElementById('createUserSubmit');
  const createUserError = document.getElementById('createUserError');
  const switchToCreateUserBtn = document.getElementById('switchToCreateUserBtn');
  const switchToLoginBtn = document.getElementById('switchToLoginBtn');

  const appEl = document.getElementById('app');
  const currentUserBadge = document.getElementById('currentUserBadge');
  const currentUserName = document.getElementById('currentUserName');
  const bookshelfBtn = document.getElementById('bookshelfBtn');
  const currentBookTitle = document.getElementById('currentBookTitle');
  const bookshelfModal = document.getElementById('bookshelfModal');
  const bookshelfBackdrop = document.getElementById('bookshelfBackdrop');
  const closeBookshelfBtn = document.getElementById('closeBookshelfBtn');
  const bookshelfGrid = document.getElementById('bookshelfGrid');
  const openNewBookModalBtn = document.getElementById('openNewBookModalBtn');

  const newBookModal = document.getElementById('newBookModal');
  const newBookBackdrop = document.getElementById('newBookBackdrop');
  const closeNewBookBtn = document.getElementById('closeNewBookBtn');
  const newBookForm = document.getElementById('newBookForm');
  const newBookTitleInput = document.getElementById('newBookTitleInput');
  const cancelNewBookBtn = document.getElementById('cancelNewBookBtn');

  const titleInput = document.getElementById('titleInput');
  const fontSelect = document.getElementById('fontSelect');
  const sizeSelect = document.getElementById('sizeSelect');
  const colorInput = document.getElementById('colorInput');
  const highlightInput = document.getElementById('highlightInput');
  const emojiBtn = document.getElementById('emojiBtn');
  const emojiPicker = document.getElementById('emojiPicker');
  const emojiSearch = document.getElementById('emojiSearch');
  const closeEmojiPickerBtn = document.getElementById('closeEmojiPickerBtn');
  const emojiCategories = document.getElementById('emojiCategories');
  const emojiGrid = document.getElementById('emojiGrid');
  const imageBtn = document.getElementById('imageBtn');
  const imageFile = document.getElementById('imageFile');
  const videoBtn = document.getElementById('videoBtn');
  const videoFile = document.getElementById('videoFile');
  const mediaUploadToast = document.getElementById('mediaUploadToast');
  const toastTitle = document.getElementById('toastTitle');
  const toastProgressFill = document.getElementById('toastProgressFill');
  const toastStats = document.getElementById('toastStats');
  const linkBtn = document.getElementById('linkBtn');
  const saveStatus = document.getElementById('saveStatus');
  const settingsBtn = document.getElementById('settingsBtn');
  const lockBtn = document.getElementById('lockBtn');

  const bookEl = document.getElementById('book');
  const pageViewportEl = document.getElementById('pageViewport');
  const underLeftEl = document.getElementById('underLeft');
  const underRightEl = document.getElementById('underRight');
  const leftPageEl = document.getElementById('leftPage');
  const rightPageEl = document.getElementById('rightPage');
  const rightEmptyEl = document.getElementById('rightEmpty');
  const addPageInlineBtn = document.getElementById('addPageInline');
  const flipLayerLeftEl = document.getElementById('flipLayerLeft');
  const flipLayerRightEl = document.getElementById('flipLayerRight');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const addPageBtn = document.getElementById('addPageBtn');
  const deletePageBtn = document.getElementById('deletePageBtn');
  const pageIndicator = document.getElementById('pageIndicator');

  const settingsDrawer = document.getElementById('settingsDrawer');
  const newPasswordInput = document.getElementById('newPasswordInput');
  const newPasswordConfirm = document.getElementById('newPasswordConfirm');
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const settingsMsg = document.getElementById('settingsMsg');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');

  // ---------- constants ----------
  const FONTS = [
    { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Palatino', value: "'Palatino Linotype', Palatino, 'Book Antiqua', serif" },
    { label: 'Garamond', value: "Garamond, 'Book Antiqua', serif" },
    { label: 'Baskerville', value: "Baskerville, 'Times New Roman', serif" },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
    { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" },
    { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
    { label: 'Courier New', value: "'Courier New', Courier, monospace" },
    { label: 'Consolas', value: "Consolas, 'Courier New', monospace" },
    { label: 'Comic Sans MS', value: "'Comic Sans MS', 'Comic Sans', cursive" },
    { label: 'Brush Script', value: "'Brush Script MT', 'Segoe Script', cursive" },
    { label: 'Papyrus', value: 'Papyrus, fantasy' },
    { label: 'Impact', value: "Impact, 'Arial Narrow Bold', sans-serif" },
  ];
  const SIZES = ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px'];
  const DEFAULT_FONT = FONTS[0].value;
  const DEFAULT_SIZE = '18px';

  // ---------- state ----------
  let notebook = null;
  let vault = null;
  let currentUser = 'default';
  let leftIndex = 0;       // index of the page shown in the LEFT slot; always even
  let activeSlot = 'left'; // 'left' | 'right' — whichever page last had focus
  let activePageEl = null;
  let flipping = false;
  let saveTimer = null;
  let savedRange = null;
  let mode = 'unlock'; // or 'setup'
  let selectedBookId = null;
  let selectedBookOwner = null;

  let lockoutTimer = null;

  function startLockoutCountdown(remainingSeconds) {
    if (lockoutTimer) clearInterval(lockoutTimer);
    let secondsLeft = remainingSeconds;
    if (passwordInput) passwordInput.disabled = true;
    if (lockSubmit) lockSubmit.disabled = true;

    function update() {
      if (secondsLeft <= 0) {
        clearInterval(lockoutTimer);
        lockoutTimer = null;
        if (passwordInput) passwordInput.disabled = false;
        if (lockSubmit) lockSubmit.disabled = false;
        if (lockError) {
          lockError.className = 'lock-error';
          lockError.textContent = 'Lockout expired. You may try unlocking again.';
        }
        return;
      }
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      if (lockError) {
        lockError.className = 'lock-error lockout-warning';
        lockError.innerHTML = `🔒 <b>Security Lockout Active</b><br>5 failed attempts detected. Notebook locked for 30 minutes.<br><b>Try again in ${timeStr}</b>`;
      }
      secondsLeft--;
    }
    update();
    lockoutTimer = setInterval(update, 1000);
  }

  // ---------- Tab Navigation & Password Visibility Toggles ----------
  function switchLockTab(tabName) {
    const tabs = [
      { name: 'notebooks', btn: tabAllNotebooks, view: viewAllNotebooks },
      { name: 'login', btn: tabLogin, view: viewLogin },
      { name: 'create', btn: tabCreateUser, view: viewCreateUser },
    ];

    tabs.forEach((t) => {
      if (!t.btn || !t.view) return;
      const isActive = t.name === tabName;
      t.btn.classList.toggle('active', isActive);
      t.btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.view.hidden = !isActive;
    });

    if (tabName === 'notebooks') {
      refreshLockNotebooksList();
    } else if (tabName === 'login') {
      if (passwordInput) passwordInput.focus();
    } else if (tabName === 'create') {
      if (createUsernameInput) createUsernameInput.focus();
    }
  }

  function wirePasswordToggles() {
    document.querySelectorAll('.toggle-password-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
          btn.title = 'Hide password';
        } else {
          input.type = 'password';
          btn.textContent = '👁️';
          btn.title = 'Show password';
        }
      });
    });

    if (toggleShowAllPasswords) {
      toggleShowAllPasswords.addEventListener('change', () => {
        const show = toggleShowAllPasswords.checked;
        const targetInputs = [createPasswordInput, createConfirmPasswordInput, passwordInput, confirmInput];
        targetInputs.forEach((input) => {
          if (input) input.type = show ? 'text' : 'password';
        });
        document.querySelectorAll('.toggle-password-btn').forEach((btn) => {
          btn.textContent = show ? '🙈' : '👁️';
          btn.title = show ? 'Hide password' : 'Show password';
        });
      });
    }
  }

  function wireLockNavigation() {
    if (tabAllNotebooks) tabAllNotebooks.addEventListener('click', () => switchLockTab('notebooks'));
    if (tabLogin) tabLogin.addEventListener('click', () => switchLockTab('login'));
    if (tabCreateUser) tabCreateUser.addEventListener('click', () => switchLockTab('create'));

    if (shelfCreateBtn) shelfCreateBtn.addEventListener('click', () => switchLockTab('create'));
    if (switchToCreateUserBtn) switchToCreateUserBtn.addEventListener('click', () => switchLockTab('create'));
    if (switchToLoginBtn) switchToLoginBtn.addEventListener('click', () => switchLockTab('login'));

    if (clearSelectedNotebookBtn) {
      clearSelectedNotebookBtn.addEventListener('click', clearSelectedNotebook);
    }
  }

  async function refreshLockNotebooksList() {
    if (!lockNotebooksList) return;
    lockNotebooksList.innerHTML = '<div style="text-align:center;color:rgba(244,237,222,0.6);padding:14px;">Loading library collection...</div>';
    try {
      const res = await fetch('/api/library');
      const data = await res.json();
      const notebooks = (data && data.notebooks) || [];

      if (lockBookCountText) {
        lockBookCountText.textContent = notebooks.length === 1 ? '1 Notebook in Library' : `${notebooks.length} Notebooks in Library`;
      }
      if (lockBookCountBadge) {
        lockBookCountBadge.hidden = notebooks.length === 0;
      }

      if (notebooks.length === 0) {
        lockNotebooksList.innerHTML = `
          <div style="text-align:center;color:rgba(244,237,222,0.75);padding:18px 12px;background:rgba(0,0,0,0.25);border-radius:8px;border:1px dashed rgba(184,147,90,0.3);">
            <div style="font-size:1.6rem;margin-bottom:6px;">📖</div>
            <p style="margin:0 0 10px;font-size:0.9rem;">No notebooks found yet.</p>
            <button type="button" class="brass-btn" style="padding:7px 14px;font-size:0.85rem;" id="emptyCreateBtn">Create Your First Notebook</button>
          </div>
        `;
        const emptyCreateBtn = document.getElementById('emptyCreateBtn');
        if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', () => switchLockTab('create'));
        return;
      }

      lockNotebooksList.innerHTML = '';
      notebooks.forEach((b) => {
        const card = document.createElement('div');
        const isSelected = selectedBookId === b.id;
        card.className = 'lock-book-card' + (isSelected ? ' selected' : '');
        const spineClass = 'spine-' + (b.coverColor || 'brown');
        const pageStr = (b.pageCount || 1) + ((b.pageCount === 1) ? ' page' : ' pages');
        const owner = b.owner || 'default';
        const updatedStr = b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : '';

        card.innerHTML = `
          <div class="lock-book-left">
            <div class="lock-book-spine-mini ${spineClass}"></div>
            <div class="lock-book-info">
              <div class="lock-book-title">${escapeHtml(b.title || 'Untitled Notebook')}</div>
              <div class="lock-book-meta">
                <span class="lock-book-owner-badge">👤 ${escapeHtml(owner)}</span>
                <span>${pageStr}</span>
                ${updatedStr ? `<span>· ${updatedStr}</span>` : ''}
              </div>
            </div>
          </div>
          <button type="button" class="lock-book-open-btn">Open 🔓</button>
        `;

        card.addEventListener('click', () => {
          selectNotebookForUnlock(b);
        });

        lockNotebooksList.appendChild(card);
      });
    } catch (e) {
      lockNotebooksList.innerHTML = '<div style="text-align:center;color:var(--danger-bright);padding:14px;">Could not load library.</div>';
    }
  }

  function selectNotebookForUnlock(book) {
    selectedBookId = book.id;
    selectedBookOwner = book.owner || 'default';
    if (usernameInput) usernameInput.value = (selectedBookOwner !== 'default') ? selectedBookOwner : '';
    if (selectedNotebookBanner) {
      selectedNotebookBanner.hidden = false;
      if (selectedNotebookTitle) selectedNotebookTitle.textContent = book.title || 'My Notebook';
      if (selectedNotebookOwner) selectedNotebookOwner.textContent = `Owner: ${selectedBookOwner}`;
      if (bannerSpine) {
        bannerSpine.className = 'banner-spine spine-' + (book.coverColor || 'brown');
      }
    }
    switchLockTab('login');
    if (passwordInput) {
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  function clearSelectedNotebook() {
    selectedBookId = null;
    selectedBookOwner = null;
    if (selectedNotebookBanner) selectedNotebookBanner.hidden = true;
    if (usernameInput) usernameInput.value = '';
  }

  // ---------- init ----------
  async function init() {
    populateControls();
    wireBookshelf();
    wireEmojiPicker();
    wirePasswordToggles();
    wireLockNavigation();

    try {
      const res = await fetch('/api/status');
      const status = await res.json();

      if (status.unlocked) {
        const nbRes = await fetch('/api/notebook').then((r) => r.json());
        if (nbRes.ok) {
          bootFromNotebook(nbRes.notebook, nbRes.vault, status.currentUser);
          return;
        }
      }

      mode = status.setupNeeded ? 'setup' : 'unlock';
      if (status.bookCount !== undefined && status.bookCount > 0) {
        if (lockBookCountBadge) lockBookCountBadge.hidden = false;
        if (lockBookCountText) {
          lockBookCountText.textContent = status.bookCount === 1 ? '1 Notebook in Library' : `${status.bookCount} Notebooks in Library`;
        }
      }

      if (mode === 'setup') {
        lockTitle.textContent = 'Begin Your Notebook';
        lockSubtitle.textContent = 'Create your account and choose a password to encrypt your notebook.';
        switchLockTab('create');
      } else {
        lockTitle.textContent = 'Leatherbound Notebook';
        lockSubtitle.textContent = 'Log in to your private encrypted vault.';
        switchLockTab('login');
      }

      if (status.lockedOut && status.remainingSeconds > 0) {
        startLockoutCountdown(status.remainingSeconds);
      }
    } catch (err) {
      lockSubtitle.textContent = 'Could not reach the server. Is it running?';
    }
  }

  function populateControls() {
    FONTS.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.value;
      opt.textContent = f.label;
      fontSelect.appendChild(opt);
    });
    SIZES.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s.replace('px', '');
      sizeSelect.appendChild(opt);
    });
  }

  // ---------- bookshelf & multiple books ----------
  function applyCoverTheme(theme) {
    document.body.dataset.cover = theme || 'brown';
  }

  function wireBookshelf() {
    if (bookshelfBtn) {
      bookshelfBtn.addEventListener('click', openBookshelf);
    }
    if (closeBookshelfBtn) {
      closeBookshelfBtn.addEventListener('click', closeBookshelf);
    }
    if (bookshelfBackdrop) {
      bookshelfBackdrop.addEventListener('click', closeBookshelf);
    }
    if (openNewBookModalBtn) {
      openNewBookModalBtn.addEventListener('click', () => {
        closeBookshelf();
        openNewBook();
      });
    }
    if (closeNewBookBtn) {
      closeNewBookBtn.addEventListener('click', closeNewBook);
    }
    if (newBookBackdrop) {
      newBookBackdrop.addEventListener('click', closeNewBook);
    }
    if (cancelNewBookBtn) {
      cancelNewBookBtn.addEventListener('click', closeNewBook);
    }
    if (newBookForm) {
      newBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = newBookTitleInput.value.trim();
        if (!title) return;
        const colorRadio = newBookForm.querySelector('input[name="coverColor"]:checked');
        const coverColor = colorRadio ? colorRadio.value : 'brown';
        await createNewBook(title, coverColor);
      });
    }
  }

  async function openBookshelf() {
    if (bookshelfModal) bookshelfModal.hidden = false;
    await refreshBookshelfGrid();
  }

  function closeBookshelf() {
    if (bookshelfModal) bookshelfModal.hidden = true;
  }

  function openNewBook() {
    if (newBookTitleInput) newBookTitleInput.value = '';
    if (newBookModal) newBookModal.hidden = false;
    if (newBookTitleInput) newBookTitleInput.focus();
  }

  function closeNewBook() {
    if (newBookModal) newBookModal.hidden = true;
  }

  async function refreshBookshelfGrid() {
    if (!bookshelfGrid) return;
    bookshelfGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: rgba(244,237,222,0.6); padding: 20px;">Loading library...</div>';
    try {
      const res = await fetch('/api/books');
      if (res.status === 401) return handleSessionLocked();
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      bookshelfGrid.innerHTML = '';
      data.books.forEach((b) => {
        const item = document.createElement('div');
        const isActive = (b.id === (notebook && notebook.id)) || (b.id === data.activeBookId);
        item.className = 'book-card-item' + (isActive ? ' book-card-item--active' : '');

        const colorClass = 'spine-' + (b.coverColor || 'brown');
        const pageCountStr = b.pageCount + (b.pageCount === 1 ? ' page' : ' pages');
        const updatedStr = b.updatedAt ? new Date(b.updatedAt).toLocaleDateString() : '';

        item.innerHTML = `
          <div class="book-card-header">
            <div class="book-card-spine ${colorClass}"></div>
            <div class="book-card-info">
              <h4 class="book-card-title">${escapeHtml(b.title)}</h4>
              <div class="book-card-meta">${pageCountStr} · ${updatedStr}</div>
            </div>
            ${isActive ? '<span class="book-card-badge">Active</span>' : ''}
          </div>
          <div class="book-card-footer">
            <button type="button" class="book-action-btn book-action-btn--rename" title="Rename notebook">✏ Rename</button>
            ${data.books.length > 1 ? '<button type="button" class="book-action-btn book-action-btn--delete" title="Delete notebook">🗑 Delete</button>' : ''}
          </div>
        `;

        item.addEventListener('click', (e) => {
          if (e.target.closest('.book-action-btn')) return;
          if (isActive) {
            closeBookshelf();
            return;
          }
          switchBook(b.id);
        });

        const renameBtn = item.querySelector('.book-action-btn--rename');
        if (renameBtn) {
          renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            renameBook(b.id, b.title);
          });
        }

        const deleteBtn = item.querySelector('.book-action-btn--delete');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteBook(b.id, b.title);
          });
        }

        bookshelfGrid.appendChild(item);
      });
    } catch (err) {
      bookshelfGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--danger-bright); padding: 20px;">Could not load bookshelf.</div>';
    }
  }

  async function switchBook(bookId) {
    await saveNotebook();
    try {
      const res = await fetch('/api/books/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      if (res.status === 401) return handleSessionLocked();
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      closeBookshelf();
      bootFromNotebook(data.notebook, data.vault, data.user || currentUser);
    } catch (err) {
      alert('Could not switch notebook: ' + err.message);
    }
  }

  async function createNewBook(title, coverColor) {
    await saveNotebook();
    try {
      const res = await fetch('/api/books/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, coverColor }),
      });
      if (res.status === 401) return handleSessionLocked();
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      closeNewBook();
      closeBookshelf();
      bootFromNotebook(data.notebook, data.vault, data.user || currentUser);
    } catch (err) {
      alert('Could not create notebook: ' + err.message);
    }
  }

  async function renameBook(bookId, oldTitle) {
    const newTitle = prompt('Enter new title for this notebook:', oldTitle);
    if (!newTitle || newTitle.trim() === oldTitle) return;
    try {
      const res = await fetch('/api/books/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, title: newTitle.trim() }),
      });
      if (res.status === 401) return handleSessionLocked();
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      if (notebook && notebook.id === bookId) {
        notebook.title = newTitle.trim();
        if (currentBookTitle) currentBookTitle.textContent = notebook.title;
        if (titleInput) titleInput.value = notebook.title;
      }
      await refreshBookshelfGrid();
    } catch (err) {
      alert('Could not rename notebook: ' + err.message);
    }
  }

  async function deleteBook(bookId, title) {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/books/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      if (res.status === 401) return handleSessionLocked();
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      bootFromNotebook(data.notebook, data.vault, data.user || currentUser);
      await refreshBookshelfGrid();
    } catch (err) {
      alert('Could not delete notebook: ' + err.message);
    }
  }

  // ---------- lock screen ----------
  lockForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    lockError.textContent = '';
    const password = passwordInput.value;
    const username = usernameInput ? usernameInput.value.trim() : '';

    if (mode === 'setup') {
      if (password !== (confirmInput ? confirmInput.value : '')) {
        lockError.textContent = 'Passwords do not match.';
        shakeCard();
        return;
      }
      if (password.length < 4) {
        lockError.textContent = 'Use at least 4 characters.';
        shakeCard();
        return;
      }
      await submitAuth('/api/setup', { password, username });
    } else {
      await submitAuth('/api/unlock', {
        password,
        username: username || selectedBookOwner || undefined,
        bookId: selectedBookId || undefined,
      });
    }
  });

  if (createUserForm) {
    createUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (createUserError) createUserError.textContent = '';
      const username = createUsernameInput.value.trim();
      const notebookTitle = createNotebookTitleInput.value.trim();
      const password = createPasswordInput.value;
      const confirmPassword = createConfirmPasswordInput.value;
      const colorRadio = createUserForm.querySelector('input[name="createCoverColor"]:checked');
      const coverColor = colorRadio ? colorRadio.value : 'brown';

      if (password.length < 4) {
        if (createUserError) createUserError.textContent = 'Password must be at least 4 characters.';
        shakeCard();
        return;
      }

      if (password !== confirmPassword) {
        if (createUserError) createUserError.textContent = 'Passwords do not match.';
        shakeCard();
        return;
      }

      if (createUserSubmit) createUserSubmit.disabled = true;
      try {
        const res = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, notebookTitle, coverColor, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (createUserError) createUserError.textContent = data.error || 'Could not create account.';
          if (createUserSubmit) createUserSubmit.disabled = false;
          shakeCard();
          return;
        }

        clasp.classList.add('open');
        await new Promise((r) => setTimeout(r, 450));
        bootFromNotebook(data.notebook, data.vault, data.user);
      } catch (err) {
        if (createUserError) createUserError.textContent = 'Could not reach server.';
        if (createUserSubmit) createUserSubmit.disabled = false;
      }
    });
  }

  async function submitAuth(url, body) {
    lockSubmit.disabled = true;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 || data.lockedOut) {
          startLockoutCountdown(data.remainingSeconds || 1800);
        } else {
          lockError.textContent = data.error || 'Something went wrong.';
          lockSubmit.disabled = false;
        }
        shakeCard();
        return;
      }
      clasp.classList.add('open');
      await new Promise((r) => setTimeout(r, 450));
      bootFromNotebook(data.notebook, data.vault, data.user);
    } catch (err) {
      lockError.textContent = 'Could not reach the server.';
      lockSubmit.disabled = false;
    }
  }

  function shakeCard() {
    lockCard.classList.remove('shake');
    void lockCard.offsetWidth;
    lockCard.classList.add('shake');
  }

  // ---------- boot main app ----------
  function bootFromNotebook(nb, vaultData, user) {
    notebook = nb;
    if (vaultData) vault = vaultData;
    currentUser = user || (vaultData && vaultData.user) || (notebook && notebook.owner) || 'default';
    leftIndex = 0;
    activeSlot = 'left';
    activePageEl = leftPageEl;
    lockScreen.hidden = true;
    appEl.hidden = false;
    if (currentBookTitle) currentBookTitle.textContent = notebook.title || 'My Notebook';
    if (titleInput) titleInput.value = notebook.title || 'My Notebook';
    if (currentUserName) currentUserName.textContent = currentUser;
    applyCoverTheme(notebook.coverColor);

    setupPageEditable(leftPageEl, 'left');
    setupPageEditable(rightPageEl, 'right');
    setupDragDrop(leftPageEl);
    setupDragDrop(rightPageEl);
    setupTouchSwipe();

    renderSpread();

    document.addEventListener('selectionchange', () => {
      if (document.activeElement === leftPageEl || document.activeElement === rightPageEl) refreshToolbarState();
    });
  }

  // ---------- mobile detection & touch swipe ----------
  function isMobileView() {
    return window.innerWidth <= 768;
  }

  let swipeWired = false;
  function setupTouchSwipe() {
    if (swipeWired || !pageViewportEl) return;
    swipeWired = true;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    pageViewportEl.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchEndX = touchStartX;
      touchEndY = touchStartY;
    }, { passive: true });

    pageViewportEl.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return;
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }, { passive: true });

    pageViewportEl.addEventListener('touchend', () => {
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
        if (deltaX < 0) {
          flip('next');
        } else {
          flip('prev');
        }
      }
    }, { passive: true });
  }

  window.addEventListener('resize', () => {
    if (!notebook) return;
    if (isMobileView()) {
      leftIndex = Math.min(leftIndex, notebook.pages.length - 1);
    } else {
      leftIndex = Math.floor(leftIndex / 2) * 2;
    }
    renderSpread();
  });

  // ---------- rendering a spread / single page ----------
  function pageDataAt(i) {
    return notebook.pages[i] || null;
  }

  function renderSpread() {
    const isMobile = isMobileView();
    const leftData = pageDataAt(leftIndex);
    const rightData = pageDataAt(leftIndex + 1);

    leftPageEl.innerHTML = leftData ? (leftData.html || '') : '';
    applyPageStyle(leftPageEl, leftData || {});
    underLeftEl.innerHTML = '';

    if (!isMobile && rightData) {
      rightEmptyEl.hidden = true;
      rightPageEl.hidden = false;
      rightPageEl.innerHTML = rightData.html || '';
      applyPageStyle(rightPageEl, rightData);
    } else if (!isMobile) {
      rightPageEl.hidden = true;
      rightPageEl.innerHTML = '';
      rightEmptyEl.hidden = false;
    } else {
      rightPageEl.hidden = true;
      rightEmptyEl.hidden = true;
    }
    underRightEl.innerHTML = '';

    // Keep the active slot pointing somewhere real.
    if (isMobile || activeSlot === 'left' || !rightData) {
      activeSlot = 'left';
      activePageEl = leftPageEl;
    } else {
      activeSlot = 'right';
      activePageEl = rightPageEl;
    }

    const activeData = activeSlot === 'right' ? rightData : leftData;
    if (activeData) {
      fontSelect.value = activeData.font || DEFAULT_FONT;
      sizeSelect.value = activeData.fontSize || DEFAULT_SIZE;
    }

    updateNav();

    // Wire up image click overlays for the freshly-rendered pages.
    wireImageOverlays(leftPageEl);
    if (!isMobile) wireImageOverlays(rightPageEl);

    // Wire up drag-to-resize on live-embed iframe containers.
    wireEmbedResizers(leftPageEl);
    if (!isMobile) wireEmbedResizers(rightPageEl);
  }

  function applyPageStyle(el, page) {
    el.style.fontFamily = page.font || DEFAULT_FONT;
    el.style.fontSize = page.fontSize || DEFAULT_SIZE;
  }

  function updateNav() {
    const isMobile = isMobileView();
    if (isMobile) {
      prevBtn.disabled = leftIndex <= 0 || flipping;
      nextBtn.disabled = (leftIndex + 1) >= notebook.pages.length || flipping;
      deletePageBtn.disabled = notebook.pages.length <= 1;
      pageIndicator.textContent = `Page ${leftIndex + 1} of ${notebook.pages.length}`;
    } else {
      prevBtn.disabled = leftIndex <= 0 || flipping;
      nextBtn.disabled = (leftIndex + 2) >= notebook.pages.length || flipping;
      deletePageBtn.disabled = notebook.pages.length <= 1;
      const totalSpreads = Math.max(1, Math.ceil(notebook.pages.length / 2));
      const spreadNum = Math.floor(leftIndex / 2) + 1;
      const pageWord = notebook.pages.length === 1 ? 'page' : 'pages';
      pageIndicator.textContent = `Spread ${spreadNum} of ${totalSpreads} · ${notebook.pages.length} ${pageWord}`;
    }
  }

  function syncSpreadFromDOM() {
    const isMobile = isMobileView();
    const leftData = pageDataAt(leftIndex);
    if (leftData) leftData.html = leftPageEl.innerHTML;
    if (!isMobile) {
      const rightData = pageDataAt(leftIndex + 1);
      if (rightData && !rightPageEl.hidden) rightData.html = rightPageEl.innerHTML;
    }
  }

  // ---------- 3D page flip (three.js, with CSS fallback) ----------
  let flip3dPromise = null;
  function loadFlip3d() {
    if (!flip3dPromise) {
      flip3dPromise = import('./flip3d.js').catch((err) => {
        console.warn('Heavy 3D page flip unavailable, using the CSS fallback instead.', err);
        return null;
      });
    }
    return flip3dPromise;
  }

  function cssFlip(direction, flippingSlot, frontHTML, frontData, backData) {
    return new Promise((resolve) => {
      const layer = flippingSlot === 'right' ? flipLayerRightEl : flipLayerLeftEl;
      const front = layer.querySelector('.flip-face.front');
      const back = layer.querySelector('.flip-face.back');

      front.innerHTML = frontHTML;
      applyPageStyle(front, frontData || {});
      back.innerHTML = backData ? (backData.html || '') : '';
      applyPageStyle(back, backData || {});

      bookEl.classList.add('flipping');
      layer.style.display = 'block';
      layer.classList.remove('flipping-next', 'flipping-prev');
      void layer.offsetWidth; // reflow so the reset transform registers before animating
      layer.classList.add(direction === 'next' ? 'flipping-next' : 'flipping-prev');

      const onEnd = () => {
        layer.removeEventListener('transitionend', onEnd);
        layer.style.display = 'none';
        layer.classList.remove('flipping-next', 'flipping-prev');
        resolve();
      };
      layer.addEventListener('transitionend', onEnd, { once: true });
    });
  }

  async function flip(direction) {
    if (flipping || !notebook) return;
    const isMobile = isMobileView();
    const step = isMobile ? 1 : 2;
    const targetLeft = direction === 'next' ? leftIndex + step : leftIndex - step;
    if (direction === 'next' && targetLeft >= notebook.pages.length) return;
    if (direction === 'prev' && targetLeft < 0) return;

    syncSpreadFromDOM();

    if (isMobile) {
      flipping = true;
      updateNav();
      bookEl.classList.add('flipping');

      leftPageEl.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
      leftPageEl.style.opacity = '0.3';
      leftPageEl.style.transform = direction === 'next' ? 'translateX(-12px)' : 'translateX(12px)';

      await new Promise((r) => setTimeout(r, 160));

      leftIndex = targetLeft;
      activeSlot = 'left';
      renderSpread();

      leftPageEl.style.transition = 'none';
      leftPageEl.style.transform = direction === 'next' ? 'translateX(12px)' : 'translateX(-12px)';
      void leftPageEl.offsetWidth;
      leftPageEl.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
      leftPageEl.style.opacity = '1';
      leftPageEl.style.transform = 'translateX(0)';

      await new Promise((r) => setTimeout(r, 160));
      leftPageEl.style.transition = '';
      leftPageEl.style.transform = '';
      leftPageEl.style.opacity = '';

      flipping = false;
      bookEl.classList.remove('flipping');
      updateNav();
      return;
    }

    const flippingSlot = direction === 'next' ? 'right' : 'left';
    const frontEl = flippingSlot === 'right' ? rightPageEl : leftPageEl;
    const frontData = flippingSlot === 'right' ? pageDataAt(leftIndex + 1) : pageDataAt(leftIndex);
    const backIndex = direction === 'next' ? targetLeft : targetLeft + 1;
    const backData = pageDataAt(backIndex);
    const underIndex = direction === 'next' ? targetLeft + 1 : targetLeft;
    const underData = pageDataAt(underIndex);
    const underEl = flippingSlot === 'right' ? underRightEl : underLeftEl;

    // Pre-load what will be revealed underneath the flipping leaf once it
    // clears this slot, so there's nothing left to swap in visibly.
    underEl.innerHTML = underData ? (underData.html || '') : '';
    applyPageStyle(underEl, underData || {});

    flipping = true;
    updateNav();
    bookEl.classList.add('flipping');

    let usedWebgl = false;
    try {
      const mod = await loadFlip3d();
      if (mod && typeof mod.isWebglAvailable === 'function' && mod.isWebglAvailable()) {
        const bookRect = pageViewportEl.getBoundingClientRect();
        await mod.playFlip({
          direction,
          bookRect,
          frontEl,
          backHTML: backData ? (backData.html || '') : '',
          backFont: (backData && backData.font) || (frontData && frontData.font) || DEFAULT_FONT,
          backFontSize: (backData && backData.fontSize) || (frontData && frontData.fontSize) || DEFAULT_SIZE,
        });
        usedWebgl = true;
      }
    } catch (err) {
      console.warn('3D flip failed, falling back to the CSS page-turn.', err);
    }

    if (!usedWebgl) {
      await cssFlip(direction, flippingSlot, frontEl.innerHTML, frontData, backData);
    }

    leftIndex = targetLeft;
    activeSlot = direction === 'next' ? 'left' : 'right';
    renderSpread();
    flipping = false;
    bookEl.classList.remove('flipping');
    updateNav();
  }

  prevBtn.addEventListener('click', () => flip('prev'));
  nextBtn.addEventListener('click', () => flip('next'));

  // ---------- add / delete pages ----------
  async function addPage() {
    syncSpreadFromDOM();
    const isMobile = isMobileView();
    const base = pageDataAt(leftIndex) || pageDataAt(notebook.pages.length - 1) || { font: DEFAULT_FONT, fontSize: DEFAULT_SIZE };
    const newPage = { id: 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), font: base.font, fontSize: base.fontSize, html: '' };

    if (isMobile) {
      notebook.pages.splice(leftIndex + 1, 0, newPage);
      leftIndex = leftIndex + 1;
      activeSlot = 'left';
      renderSpread();
      activePageEl = leftPageEl;
      leftPageEl.focus();
      scheduleSave();
      return;
    }

    if (!pageDataAt(leftIndex + 1)) {
      // Right slot of this spread is empty — fill it, no flip needed.
      notebook.pages.splice(leftIndex + 1, 0, newPage);
      renderSpread();
      activeSlot = 'right';
      activePageEl = rightPageEl;
      rightPageEl.focus();
    } else {
      // Insert a fresh spread right after this one and turn to it.
      notebook.pages.splice(leftIndex + 2, 0, newPage);
      await flip('next');
      activeSlot = 'left';
      activePageEl = leftPageEl;
      leftPageEl.focus();
    }
    scheduleSave();
  }

  addPageBtn.addEventListener('click', addPage);
  addPageInlineBtn.addEventListener('click', addPage);

  deletePageBtn.addEventListener('click', () => {
    if (notebook.pages.length <= 1) return;
    const isMobile = isMobileView();
    const targetIdx = isMobile ? leftIndex : (activeSlot === 'right' && pageDataAt(leftIndex + 1) ? leftIndex + 1 : leftIndex);
    if (!pageDataAt(targetIdx)) return;
    if (!confirm('Delete this page? This cannot be undone.')) return;

    notebook.pages.splice(targetIdx, 1);
    if (isMobile) {
      leftIndex = Math.min(leftIndex, notebook.pages.length - 1);
      leftIndex = Math.max(0, leftIndex);
    } else {
      while (leftIndex > 0 && leftIndex >= notebook.pages.length) leftIndex -= 2;
      leftIndex = Math.max(0, leftIndex);
    }
    renderSpread();
    scheduleSave();
  });

  // ---------- editable page wiring ----------
  function setupPageEditable(el, slot) {
    el.addEventListener('focus', () => {
      activeSlot = slot;
      activePageEl = el;
      const data = slot === 'right' ? pageDataAt(leftIndex + 1) : pageDataAt(leftIndex);
      if (data) {
        fontSelect.value = data.font || DEFAULT_FONT;
        sizeSelect.value = data.fontSize || DEFAULT_SIZE;
      }
    });
    el.addEventListener('input', () => {
      syncSpreadFromDOM();
      scheduleSave();
      linkifyRecentTyping(el);
    });
    el.addEventListener('mouseup', saveSelection);
    el.addEventListener('keyup', (e) => {
      saveSelection();
      if (e.key === ' ' || e.key === 'Enter') linkifyRecentTyping(el);
    });
    el.addEventListener('paste', (e) => handlePaste(e, el));
  }

  function setupDragDrop(el) {
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    el.addEventListener('drop', async (e) => {
      e.preventDefault();
      activeSlot = el === rightPageEl ? 'right' : 'left';
      activePageEl = el;

      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && file.type && file.type.startsWith('image/')) {
        try {
          const url = await uploadImageFile(file);
          placeCaretFromPoint(e.clientX, e.clientY, el);
          document.execCommand('insertImage', false, url);
          syncSpreadFromDOM();
          scheduleSave();
          wireImageOverlays(el);
        } catch (err) {
          alert('Could not add that image.');
        }
        return;
      }

      const text = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      const trimmed = text ? text.trim() : '';
      if (/^https?:\/\/\S+$/i.test(trimmed)) {
        placeCaretFromPoint(e.clientX, e.clientY, el);
        const html = await buildUrlInsertHTML(trimmed);
        document.execCommand('insertHTML', false, html);
        syncSpreadFromDOM();
        scheduleSave();
      }
    });
  }

  function placeCaretFromPoint(x, y, el) {
    el.focus();
    let range = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
      }
    }
    if (range) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  // ---------- toolbar: text formatting ----------
  document.querySelectorAll('[data-cmd]').forEach((btn) => {
    btn.addEventListener('mousedown', (e) => e.preventDefault()); // keep selection alive
    btn.addEventListener('click', () => {
      document.execCommand(btn.dataset.cmd, false, null);
      refreshToolbarState();
      syncSpreadFromDOM();
      scheduleSave();
    });
  });

  function refreshToolbarState() {
    ['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight'].forEach((cmd) => {
      const btn = document.querySelector(`[data-cmd="${cmd}"]`);
      if (!btn) return;
      try {
        btn.classList.toggle('active', document.queryCommandState(cmd));
      } catch (e) {
        /* ignore */
      }
    });
  }

  fontSelect.addEventListener('change', () => {
    const data = activeSlot === 'right' ? pageDataAt(leftIndex + 1) : pageDataAt(leftIndex);
    if (!data) return;
    data.font = fontSelect.value;
    activePageEl.style.fontFamily = data.font;
    scheduleSave();
  });

  sizeSelect.addEventListener('change', () => {
    const data = activeSlot === 'right' ? pageDataAt(leftIndex + 1) : pageDataAt(leftIndex);
    if (!data) return;
    data.fontSize = sizeSelect.value;
    activePageEl.style.fontSize = data.fontSize;
    scheduleSave();
  });

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (activePageEl && activePageEl.contains(r.commonAncestorContainer)) savedRange = r.cloneRange();
    }
  }
  function restoreSelection() {
    if (!savedRange) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  }

  colorInput.addEventListener('input', () => {
    activePageEl.focus();
    restoreSelection();
    document.execCommand('foreColor', false, colorInput.value);
    syncSpreadFromDOM();
    scheduleSave();
  });

  highlightInput.addEventListener('input', () => {
    activePageEl.focus();
    restoreSelection();
    document.execCommand('hiliteColor', false, highlightInput.value);
    syncSpreadFromDOM();
    scheduleSave();
  });

  // ---------- emoji picker ----------
  const EMOJI_DATA = {
    smileys: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤'],
    gestures: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄'],
    books: ['📚','📖','📕','📗','📘','📙','📓','📔','📒','📜','📄','📰','📑','🔖','🏷️','📝','✏️','✒️','🖋️','🖊️','🖌️','🖍️','📌','📍','📎','🖇️','📏','📐','📋','📁','📂','🗂️','🗃️','🗳️','🏛️','🎓','🎒'],
    nature: ['🌿','🌱','🌲','🌳','🌴','🌵','🌾','🍀','🍁','🍂','🍃','🌸','🌹','🌺','🌻','🌼','🌷','🐾','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦅','🦆','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🦂','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🐓','🦃','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦦','🦥','🐁','🐀','🐿️','🦔'],
    food: ['☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🥦','🥬','🥒','🌶️','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥣','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯'],
    objects: ['💡','🕯️','🔦','🏮','🪔','🧱','🪵','🪨','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🪫','🔌','💻','🖥️','🖨️','⌨️','🖱️','🖲️','💽','💾','💿','📀','📱','☎️','📞','📟','📠','📺','📻','🎙️','🎚️','🎛️','🛑','🚧','🚨','🛞','⚓','🛟','🪝','🧰','🧲','🪜','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪓','🪚','🔩','⚙️','🪤','🗝️','🔑','🔒','🔓','🔏','🔐'],
    symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','❇️','✨','🌟','⭐','🌠','💫','⚡','☄️','💥','🔥','🌪️','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','🌨️','🌩️','❄️','☃️','⛄','🌬️','💨','💧','💦','🫧','☔','☂️','🌊','🎉','🎊','🎈','🎂','🎁','🎖️','🏆','🏅','🥇','🥈','🥉'],
  };

  let activeEmojiCategory = 'smileys';

  function wireEmojiPicker() {
    if (!emojiBtn || !emojiPicker) return;

    emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      saveSelection();
      const isHidden = emojiPicker.hidden;
      emojiPicker.hidden = !isHidden;
      if (!emojiPicker.hidden) {
        renderEmojiGrid(activeEmojiCategory);
        if (emojiSearch) {
          emojiSearch.value = '';
          emojiSearch.focus();
        }
      }
    });

    if (closeEmojiPickerBtn) {
      closeEmojiPickerBtn.addEventListener('click', () => {
        emojiPicker.hidden = true;
      });
    }

    if (emojiCategories) {
      emojiCategories.querySelectorAll('.emoji-cat-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          emojiCategories.querySelectorAll('.emoji-cat-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          activeEmojiCategory = btn.dataset.cat;
          renderEmojiGrid(activeEmojiCategory, emojiSearch ? emojiSearch.value : '');
        });
      });
    }

    if (emojiSearch) {
      emojiSearch.addEventListener('input', () => {
        const query = emojiSearch.value.trim().toLowerCase();
        renderEmojiGrid(activeEmojiCategory, query);
      });
    }

    document.addEventListener('click', (e) => {
      if (emojiPicker && !emojiPicker.hidden && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.hidden = true;
      }
    });
  }

  function renderEmojiGrid(category, searchFilter = '') {
    if (!emojiGrid) return;
    emojiGrid.innerHTML = '';
    let emojis = [];
    if (searchFilter) {
      Object.values(EMOJI_DATA).forEach((list) => {
        emojis.push(...list);
      });
    } else {
      emojis = EMOJI_DATA[category] || EMOJI_DATA.smileys;
    }

    emojis.forEach((emoji) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-item-btn';
      btn.textContent = emoji;
      btn.title = emoji;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        insertEmojiIntoActivePage(emoji);
      });
      emojiGrid.appendChild(btn);
    });
  }

  function insertEmojiIntoActivePage(emoji) {
    if (!activePageEl) activePageEl = leftPageEl;
    activePageEl.focus();
    restoreSelection();
    document.execCommand('insertText', false, emoji);
    syncSpreadFromDOM();
    scheduleSave();
    saveSelection();
  }

  // ---------- media & video: raw binary upload (up to 1GB) & on-the-fly streaming ----------

  function uploadLargeMediaFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/media/upload', true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name || 'media'));
      const extMatch = file.name ? file.name.match(/\.([a-z0-9]+)$/i) : null;
      const ext = extMatch ? extMatch[1] : (file.type.includes('video') ? 'mp4' : (file.type.includes('audio') ? 'mp3' : 'jpg'));
      xhr.setRequestHeader('X-File-Ext', ext);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            const loadedMB = (e.loaded / (1024 * 1024)).toFixed(1);
            const totalMB = (e.total / (1024 * 1024)).toFixed(1);
            onProgress(percent, loadedMB, totalMB);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status === 401) {
          handleSessionLocked();
          return reject(new Error('Session locked'));
        }
        try {
          const json = JSON.parse(xhr.responseText);
          if (!json.ok) return reject(new Error(json.error || 'Upload failed'));
          resolve(json);
        } catch (err) {
          reject(new Error('Server response error'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during media upload'));
      xhr.send(file);
    });
  }

  // ---------- images: upload to server, insert /images/... URL ----------

  imageBtn.addEventListener('click', () => {
    saveSelection();
    imageFile.click();
  });

  imageFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let url;
      // If large image (> 5MB) or animated/vector (GIF/SVG), use direct binary streaming upload
      if (file.size > 5 * 1024 * 1024 || file.type === 'image/gif' || file.type === 'image/svg+xml') {
        if (mediaUploadToast) {
          mediaUploadToast.hidden = false;
          if (toastTitle) toastTitle.textContent = `Uploading ${file.name}...`;
          if (toastProgressFill) toastProgressFill.style.width = '0%';
          if (toastStats) toastStats.textContent = `0% (0 MB / ${(file.size / (1024 * 1024)).toFixed(1)} MB)`;
        }
        const data = await uploadLargeMediaFile(file, (percent, loadedMB, totalMB) => {
          if (toastProgressFill) toastProgressFill.style.width = `${percent}%`;
          if (toastStats) toastStats.textContent = `${percent}% (${loadedMB} MB / ${totalMB} MB)`;
        });
        url = data.url;
      } else {
        url = await uploadImageFile(file);
      }
      activePageEl.focus();
      restoreSelection();
      document.execCommand('insertImage', false, url);
      syncSpreadFromDOM();
      scheduleSave();
      wireImageOverlays(activePageEl);
    } catch (err) {
      alert('Could not add that image: ' + err.message);
    } finally {
      imageFile.value = '';
      if (mediaUploadToast) {
        setTimeout(() => {
          mediaUploadToast.hidden = true;
        }, 800);
      }
    }
  });

  // ---------- video & audio: large binary upload (200-300MB+) & playback ----------

  if (videoBtn && videoFile) {
    videoBtn.addEventListener('click', () => {
      saveSelection();
      videoFile.click();
    });

    videoFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name);
      const totalMBStr = (file.size / (1024 * 1024)).toFixed(1);

      if (mediaUploadToast) {
        mediaUploadToast.hidden = false;
        if (toastTitle) toastTitle.textContent = `Uploading ${isAudio ? 'Audio' : 'Video'} (${totalMBStr} MB)...`;
        if (toastProgressFill) toastProgressFill.style.width = '0%';
        if (toastStats) toastStats.textContent = `0% (0 MB / ${totalMBStr} MB)`;
      }

      try {
        const data = await uploadLargeMediaFile(file, (percent, loadedMB, totalMB) => {
          if (toastProgressFill) toastProgressFill.style.width = `${percent}%`;
          if (toastStats) toastStats.textContent = `${percent}% (${loadedMB} MB / ${totalMB} MB)`;
        });

        if (!activePageEl) activePageEl = leftPageEl;
        activePageEl.focus();
        restoreSelection();

        if (data.isAudio || isAudio) {
          const audioHtml = `<div class="media-container audio-container" contenteditable="false"><audio class="vintage-audio" controls preload="metadata" src="${data.url}"></audio></div><p><br></p>`;
          document.execCommand('insertHTML', false, audioHtml);
        } else {
          const videoHtml = `<div class="media-container video-container" contenteditable="false"><video class="vintage-video" controls playsinline preload="metadata" src="${data.url}"></video></div><p><br></p>`;
          document.execCommand('insertHTML', false, videoHtml);
        }

        syncSpreadFromDOM();
        scheduleSave();
      } catch (err) {
        alert('Could not upload video/media: ' + err.message);
      } finally {
        videoFile.value = '';
        if (mediaUploadToast) {
          setTimeout(() => {
            mediaUploadToast.hidden = true;
          }, 800);
        }
      }
    });
  }

  /**
   * Resize standard images client-side, then POST to /api/images.
   * Returns a server-relative URL like "/images/abc123.jpg".
   */
  async function uploadImageFile(file, maxDim = 1100, quality = 0.85) {
    const dataUrl = await resizeToDataUrl(file, maxDim, quality);
    const extMatch = file.type.match(/image\/([a-z+]+)/i);
    const ext = extMatch ? extMatch[1].replace('jpeg', 'jpg') : 'jpg';
    const res = await fetch('/api/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: dataUrl, ext }),
    });
    if (res.status === 401) { handleSessionLocked(); throw new Error('locked'); }
    if (!res.ok) throw new Error('Upload failed');
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Upload failed');
    return json.url;
  }

  function resizeToDataUrl(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ---------- image overlay: click → resize / move / delete ----------

  let activeOverlay = null; // { overlay, img, pageEl }

  function wireImageOverlays(pageEl) {
    if (!pageEl) return;
    pageEl.querySelectorAll('img').forEach((img) => {
      // Avoid double-wiring.
      if (img.dataset.overlayWired) return;
      img.dataset.overlayWired = '1';
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        showImageOverlay(img, pageEl);
      });
      // Prevent the browser's default drag behaviour on images inside
      // contenteditable — we handle drag-to-move ourselves.
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });
  }

  function showImageOverlay(img, pageEl) {
    dismissOverlay();

    const overlay = document.createElement('div');
    overlay.className = 'img-overlay';
    document.body.appendChild(overlay);
    activeOverlay = { overlay, img, pageEl };

    positionOverlay(overlay, img);

    // -- Drag handle (move up/down in content) --
    const dragHandle = document.createElement('div');
    dragHandle.className = 'img-overlay__drag';
    dragHandle.title = 'Drag to move';
    dragHandle.textContent = '⠿';
    overlay.appendChild(dragHandle);

    // -- Delete button --
    const delBtn = document.createElement('button');
    delBtn.className = 'img-overlay__delete';
    delBtn.title = 'Delete image';
    delBtn.textContent = '🗑';
    overlay.appendChild(delBtn);

    delBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Remove this image?')) return;
      const src = img.getAttribute('src');
      img.remove();
      dismissOverlay();
      syncSpreadFromDOM();
      scheduleSave();
      // Best-effort server-side delete.
      if (src && src.startsWith('/images/')) {
        const filename = src.split('/').pop();
        fetch('/api/images/' + encodeURIComponent(filename), { method: 'DELETE' }).catch(() => {});
      }
    });

    // -- 8 resize handles --
    const HANDLES = [
      { cls: 'nw', cursor: 'nw-resize', dx: -1, dy: -1 },
      { cls: 'n',  cursor: 'n-resize',  dx:  0, dy: -1 },
      { cls: 'ne', cursor: 'ne-resize', dx:  1, dy: -1 },
      { cls: 'w',  cursor: 'w-resize',  dx: -1, dy:  0 },
      { cls: 'e',  cursor: 'e-resize',  dx:  1, dy:  0 },
      { cls: 'sw', cursor: 'sw-resize', dx: -1, dy:  1 },
      { cls: 's',  cursor: 's-resize',  dx:  0, dy:  1 },
      { cls: 'se', cursor: 'se-resize', dx:  1, dy:  1 },
    ];

    HANDLES.forEach(({ cls, cursor, dx, dy }) => {
      const handle = document.createElement('div');
      handle.className = 'img-overlay__handle img-overlay__handle--' + cls;
      handle.style.cursor = cursor;
      overlay.appendChild(handle);

      let startX, startY, startW, startH;
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startX = e.clientX;
        startY = e.clientY;
        startW = img.offsetWidth || img.naturalWidth;
        startH = img.offsetHeight || img.naturalHeight;

        function onMove(ev) {
          const deltaX = ev.clientX - startX;
          const deltaY = ev.clientY - startY;
          if (dx !== 0) {
            const newW = Math.max(40, startW + dx * deltaX);
            img.style.width = newW + 'px';
            img.style.height = 'auto';
          }
          if (dy !== 0 && dx === 0) {
            // Pure vertical: height only
            const newH = Math.max(40, startH + dy * deltaY);
            img.style.height = newH + 'px';
            img.style.width = 'auto';
          }
          positionOverlay(overlay, img);
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          syncSpreadFromDOM();
          scheduleSave();
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });

    // -- Drag handle: move image up/down in the text flow --
    let dragStartY, imgClone;
    dragHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragStartY = e.clientY;

      // Ghost clone
      imgClone = img.cloneNode();
      imgClone.style.opacity = '0.45';
      imgClone.style.pointerEvents = 'none';
      imgClone.style.position = 'fixed';
      imgClone.style.zIndex = '9999';
      imgClone.style.width = img.offsetWidth + 'px';
      document.body.appendChild(imgClone);

      function onMove(ev) {
        const rect = img.getBoundingClientRect();
        imgClone.style.left = rect.left + 'px';
        imgClone.style.top = (rect.top + ev.clientY - dragStartY) + 'px';

        // Find drop position: element at the pointer inside pageEl
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        if (el && el !== img && pageEl.contains(el)) {
          const elRect = el.getBoundingClientRect();
          const midY = elRect.top + elRect.height / 2;
          if (ev.clientY < midY) {
            pageEl.insertBefore(img, el);
          } else {
            el.after(img);
          }
          // Re-wire overlay position after DOM move
          positionOverlay(overlay, img);
        }
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (imgClone) { imgClone.remove(); imgClone = null; }
        positionOverlay(overlay, img);
        syncSpreadFromDOM();
        scheduleSave();
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Update overlay position on scroll or resize.
    const reposition = () => positionOverlay(overlay, img);
    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition, { passive: true });
    overlay._cleanup = () => {
      window.removeEventListener('scroll', reposition);
      window.removeEventListener('resize', reposition);
    };
  }

  function positionOverlay(overlay, img) {
    const r = img.getBoundingClientRect();
    overlay.style.left = (r.left + window.scrollX) + 'px';
    overlay.style.top = (r.top + window.scrollY) + 'px';
    overlay.style.width = r.width + 'px';
    overlay.style.height = r.height + 'px';
  }

  function dismissOverlay() {
    if (!activeOverlay) return;
    if (activeOverlay.overlay._cleanup) activeOverlay.overlay._cleanup();
    activeOverlay.overlay.remove();
    activeOverlay = null;
  }

  // Dismiss overlay when clicking outside an image or overlay.
  document.addEventListener('mousedown', (e) => {
    if (!activeOverlay) return;
    if (activeOverlay.overlay.contains(e.target)) return;
    if (e.target === activeOverlay.img) return;
    dismissOverlay();
  });

  // ---------- live-embed resizer & controls ----------
  function wireEmbedResizers(pageEl) {
    if (!pageEl) return;

    // 1. Ensure any previously saved embed with empty/broken src gets initialized
    // or migrated from slow proxy to fast GPU-accelerated embed (e.g. TradingView).
    pageEl.querySelectorAll('.nb-live-embed').forEach((embed) => {
      const iframe = embed.querySelector('.nb-live-embed__iframe');
      const url = embed.dataset.url;
      if (iframe && url) {
        const expectedSrc = getIframeSrcForUrl(url);
        const curSrc = iframe.getAttribute('src') || '';
        if (!curSrc || curSrc.includes('undefined') || curSrc === 'about:blank' || (url.includes('tradingview.com') && curSrc.includes('/api/proxy'))) {
          iframe.src = expectedSrc;
        }
      }
    });
  }

  // Global delegated click listener for all embed and image buttons
  document.addEventListener('click', (e) => {
    // 1. Back button
    const backBtn = e.target.closest('.nb-live-embed__btn--back');
    if (backBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = backBtn.closest('.nb-live-embed');
      const iframe = embed ? embed.querySelector('.nb-live-embed__iframe') : null;
      if (iframe && iframe.contentWindow) {
        try { iframe.contentWindow.postMessage({ type: 'nb-embed-cmd', action: 'back' }, '*'); } catch (err) {}
      }
      return;
    }

    // 2. Forward button
    const fwdBtn = e.target.closest('.nb-live-embed__btn--forward');
    if (fwdBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = fwdBtn.closest('.nb-live-embed');
      const iframe = embed ? embed.querySelector('.nb-live-embed__iframe') : null;
      if (iframe && iframe.contentWindow) {
        try { iframe.contentWindow.postMessage({ type: 'nb-embed-cmd', action: 'forward' }, '*'); } catch (err) {}
      }
      return;
    }

    // 3. Reload button
    const reloadBtn = e.target.closest('.nb-live-embed__btn--reload');
    if (reloadBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = reloadBtn.closest('.nb-live-embed');
      if (!embed) return;
      const iframe = embed.querySelector('.nb-live-embed__iframe');
      const video = embed.querySelector('.nb-live-embed__video');
      const url = embed.dataset.url;
      if (iframe && url) {
        const src = getIframeSrcForUrl(url);
        iframe.src = src + (src.includes('?') ? '&' : '?') + '_t=' + Date.now();
      } else if (video && url) {
        video.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
        video.load();
      }
      return;
    }

    // 4. Home / Reset button
    const homeBtn = e.target.closest('.nb-live-embed__btn--home');
    if (homeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = homeBtn.closest('.nb-live-embed');
      if (!embed) return;
      const iframe = embed.querySelector('.nb-live-embed__iframe');
      const url = embed.dataset.url;
      if (iframe && url) {
        iframe.src = getIframeSrcForUrl(url);
        const input = embed.querySelector('.nb-live-embed__address-input');
        if (input) input.value = url;
      }
      return;
    }

    // 5. Expand / fullscreen toggle
    const expandBtn = e.target.closest('.nb-live-embed__btn--expand');
    if (expandBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = expandBtn.closest('.nb-live-embed');
      if (embed) embed.classList.toggle('nb-live-embed--expanded');
      return;
    }

    // 6. Remove embed
    const removeBtn = e.target.closest('.nb-live-embed__btn--remove');
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const embed = removeBtn.closest('.nb-live-embed');
      if (embed) {
        embed.remove();
        syncSpreadFromDOM();
        scheduleSave();
      }
      return;
    }

    // 7. Image click: activate 8-handle resize overlay
    const img = e.target.closest('.page-content img');
    if (img) {
      const pageEl = img.closest('.page-content');
      if (pageEl) {
        e.stopPropagation();
        e.preventDefault();
        showImageOverlay(img, pageEl);
      }
    }
  });

  // Global delegated mousedown for the live embed height resize handle
  document.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.nb-live-embed__resize-handle');
    if (!handle) return;
    e.preventDefault();
    e.stopPropagation();
    const embed = handle.closest('.nb-live-embed');
    if (!embed) return;
    const wrap = embed.querySelector('.nb-live-embed__frame-wrap');
    const iframe = embed.querySelector('.nb-live-embed__iframe');
    if (!wrap) return;
    if (iframe) iframe.style.pointerEvents = 'none';
    const startY = e.clientY;
    const startH = wrap.offsetHeight;

    function onMove(ev) {
      const newH = Math.max(180, Math.min(1200, startH + (ev.clientY - startY)));
      wrap.style.height = newH + 'px';
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (iframe) iframe.style.pointerEvents = '';
      syncSpreadFromDOM();
      scheduleSave();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Global delegated keydown for omnibox address input
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = e.target.closest('.nb-live-embed__address-input');
      if (input) {
        e.preventDefault();
        const embed = input.closest('.nb-live-embed');
        if (!embed) return;
        const iframe = embed.querySelector('.nb-live-embed__iframe');
        let val = input.value.trim();
        if (!val) return;
        if (!/^https?:\/\//i.test(val) && !val.includes('.') && !val.includes('/')) {
          val = 'https://duckduckgo.com/html/?q=' + encodeURIComponent(val);
        } else if (!/^https?:\/\//i.test(val)) {
          val = 'https://' + val;
        }
        embed.dataset.url = val;
        input.value = val;
        const openBtn = embed.querySelector('.nb-live-embed__btn--open');
        if (openBtn) openBtn.href = val;
        if (iframe) iframe.src = getIframeSrcForUrl(val);
        syncSpreadFromDOM();
        scheduleSave();
      }
    }
  });

  // Global Escape key listener to close expanded fullscreen embeds
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nb-live-embed--expanded').forEach((el) => {
        el.classList.remove('nb-live-embed--expanded');
      });
    }
  });

  // Global message listener from proxied child iframes to update address bar
  window.addEventListener('message', (e) => {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === 'nb-embed-nav') {
      document.querySelectorAll('.nb-live-embed').forEach((embed) => {
        const iframe = embed.querySelector('.nb-live-embed__iframe');
        if (iframe && iframe.contentWindow === e.source) {
          const input = embed.querySelector('.nb-live-embed__address-input');
          if (input && e.data.url) {
            let displayUrl = e.data.url;
            try {
              const u = new URL(displayUrl);
              const proxiedParam = u.searchParams.get('url');
              if (proxiedParam) displayUrl = proxiedParam;
            } catch (err) {}
            input.value = displayUrl;
          }
        }
      });
    }
  });

  // ---------- live URLs: linkify, embed, preview ----------
  const BARE_URL_RE = /^https?:\/\/\S+$/i;
  const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|avif)(\?[^\s]*)?(#.*)?$/i;
  const VIDEO_EXT_RE = /\.(mp4|webm|ogg|ogv|mov|m4v)(\?[^\s]*)?(#.*)?$/i;

  function parseYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./i, '').replace(/^m\./i, '');
      if (host === 'youtu.be') {
        const id = u.pathname.slice(1).split('/')[0].split('?')[0];
        if (id && /^[\w-]{6,}$/.test(id)) return id;
      }
      if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        if (u.pathname === '/watch') {
          const v = u.searchParams.get('v');
          if (v && /^[\w-]{6,}$/.test(v)) return v;
        }
        const m = u.pathname.match(/^\/(?:shorts|embed|v)\/([\w-]{6,})/i);
        if (m) return m[1];
      }
    } catch (e) {}
    const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{6,})/i);
    return m ? m[1] : null;
  }

  function parseVimeoId(url) {
    if (!url || typeof url !== 'string') return null;
    const m = url.match(/(?:vimeo\.com\/(?:video\/|channels\/(?:\w+\/)?|groups\/[^\/]+\/videos\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
    return m ? m[1] : null;
  }

  function parseCloudDoc(url) {
    if (!url || typeof url !== 'string') return null;
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./i, '');
      // Google Drive file
      if (host === 'drive.google.com') {
        const fileMatch = u.pathname.match(/\/file\/d\/([\w-]+)/i);
        if (fileMatch) return { type: 'gdrive', id: fileMatch[1], embedUrl: `https://drive.google.com/file/d/${fileMatch[1]}/preview` };
        const idParam = u.searchParams.get('id');
        if (idParam) return { type: 'gdrive', id: idParam, embedUrl: `https://drive.google.com/file/d/${idParam}/preview` };
      }
      // Google Docs / Sheets / Slides
      if (host === 'docs.google.com') {
        const docMatch = u.pathname.match(/\/(document|spreadsheets|presentation)\/d\/([\w-]+)/i);
        if (docMatch) {
          const docType = docMatch[1];
          const docId = docMatch[2];
          return { type: 'gdocs', id: docId, embedUrl: `https://docs.google.com/${docType}/d/${docId}/preview` };
        }
      }
      // Dropbox
      if (host === 'dropbox.com') {
        const uClone = new URL(url);
        uClone.searchParams.delete('dl');
        uClone.searchParams.set('raw', '1');
        return { type: 'dropbox', id: u.pathname, embedUrl: uClone.toString() };
      }
    } catch (e) {}
    return null;
  }

  function classifyUrl(url) {
    if (IMAGE_EXT_RE.test(url)) return { type: 'image' };
    if (VIDEO_EXT_RE.test(url)) return { type: 'video' };
    const ytId = parseYouTubeId(url);
    if (ytId) return { type: 'youtube', id: ytId };
    const cloudDoc = parseCloudDoc(url);
    if (cloudDoc) return { type: 'cloud', details: cloudDoc };
    const vimeoId = parseVimeoId(url);
    if (vimeoId) return { type: 'vimeo', id: vimeoId };
    return { type: 'link' };
  }

  function parseTradingViewUrl(url) {
    if (!url || typeof url !== 'string') return null;
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./i, '').toLowerCase();
      if (host.includes('tradingview.com') || host.includes('tradingview-widget.com')) {
        let symbol = u.searchParams.get('symbol');
        if (!symbol) {
          const symMatch = u.pathname.match(/\/symbols\/([^\/]+)/i);
          if (symMatch) {
            symbol = symMatch[1].replace('-', ':');
          }
        }
        if (!symbol) symbol = 'AAPL';
        const interval = u.searchParams.get('interval') || 'D';
        const theme = u.searchParams.get('theme') || 'dark';
        return `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=1f2b23&studies=[]&theme=${theme}&style=1&timezone=exchange`;
      }
    } catch (e) {}
    return null;
  }

  function getIframeSrcForUrl(url) {
    if (!url) return '/api/proxy?url=about:blank';
    const trimmed = url.trim();
    const ytId = parseYouTubeId(trimmed);
    if (ytId) {
      return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1`;
    }
    const cloudDoc = parseCloudDoc(trimmed);
    if (cloudDoc && cloudDoc.embedUrl) {
      return cloudDoc.embedUrl;
    }
    // TradingView interactive charts — GPU-accelerated official embed widget
    const tvEmbed = parseTradingViewUrl(trimmed);
    if (tvEmbed) {
      return tvEmbed;
    }
    // Root youtube.com — interactive built-in YouTube player portal
    if (/^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/?$/i.test(trimmed)) {
      return '/api/portal/youtube';
    }
    // Google search and root — interactive built-in search portal
    if (/^(?:https?:\/\/)?(?:www\.)?google\.com\/?$/i.test(trimmed)) {
      return '/api/portal/search';
    }
    const googleSearchMatch = trimmed.match(/(?:google\.com\/search\?(?:.*&)?q=)([^&]+)/i);
    if (googleSearchMatch) {
      return '/api/portal/search?q=' + encodeURIComponent(googleSearchMatch[1]);
    }
    const vimeoId = parseVimeoId(trimmed);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
    // Everything else (including general websites) goes through the streaming proxy
    return '/api/proxy?url=' + encodeURIComponent(trimmed);
  }

  function escapeHtml(s) {
    return (s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }
  function escapeAttr(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  async function buildUrlInsertHTML(url) {
    const safeUrl = escapeAttr(url);
    const kind = classifyUrl(url);

    if (kind.type === 'image') {
      return `<img src="${safeUrl}" alt="">`;
    }
    if (kind.type === 'video') {
      const fileName = url.split('/').pop().split('?')[0] || 'Video';
      return buildDirectVideoEmbedHTML(url, fileName);
    }
    if (kind.type === 'youtube') {
      return buildLiveEmbedHTML(url, 'YouTube Video', 'youtube.com', '🎥');
    }
    if (kind.type === 'vimeo') {
      return buildLiveEmbedHTML(url, 'Vimeo Video', 'vimeo.com', '🎥');
    }
    if (kind.type === 'cloud') {
      const docName = kind.details.type === 'gdrive' ? 'Google Drive File' : (kind.details.type === 'gdocs' ? 'Google Document' : 'Cloud Document');
      const domain = kind.details.type === 'dropbox' ? 'dropbox.com' : 'google.com';
      return buildLiveEmbedHTML(url, docName, domain, '📁');
    }

    // Generic link — embed a LIVE iframe of the actual website, with a
    // header bar showing title/domain and an "open in new tab" button.
    let title = url;
    let domain = '';
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
      title = domain;
    } catch (e) { /* ignore */ }

    // Try to fetch a richer title via the server preview API.
    try {
      const res = await fetch('/api/link-preview?url=' + encodeURIComponent(url));
      const data = await res.json();
      if (data && data.ok) {
        title = data.title || title;
        domain = data.domain || domain;
      }
    } catch (err) { /* ignore */ }

    return buildLiveEmbedHTML(url, title, domain, '🌐');
  }

  /**
   * Render a live-website or video embed: a mini-browser bar (nav buttons, omnibox,
   * reload, expand, open, remove) on top, and a full interactive iframe below it.
   */
  function buildLiveEmbedHTML(url, title, domain, icon = '🌐') {
    const safeUrl = escapeAttr(url);
    const safeTitle = escapeHtml((title || url).slice(0, 120));
    const safeDomain = escapeHtml(domain || '');
    const iframeSrc = getIframeSrcForUrl(url);

    return (
      `<div class="nb-live-embed" contenteditable="false" data-url="${safeUrl}">` +
        `<div class="nb-live-embed__bar">` +
          `<div class="nb-live-embed__nav-group">` +
            `<button class="nb-live-embed__btn nb-live-embed__btn--back" title="Back">` +
              `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>` +
            `</button>` +
            `<button class="nb-live-embed__btn nb-live-embed__btn--forward" title="Forward">` +
              `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>` +
            `</button>` +
            `<button class="nb-live-embed__btn nb-live-embed__btn--reload" title="Reload">` +
              `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>` +
            `</button>` +
            `<button class="nb-live-embed__btn nb-live-embed__btn--home" title="Original Page">` +
              `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>` +
            `</button>` +
          `</div>` +
          `<div class="nb-live-embed__omnibox">` +
            `<span class="nb-live-embed__icon">${icon}</span>` +
            `<input type="text" class="nb-live-embed__address-input" value="${safeUrl}" title="Type a URL or search query and press Enter" placeholder="Enter URL or search..." />` +
          `</div>` +
          `<div class="nb-live-embed__action-group">` +
            `<button class="nb-live-embed__btn nb-live-embed__btn--expand" title="Expand / Fullscreen">` +
              `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>` +
            `</button>` +
            `<a class="nb-live-embed__btn nb-live-embed__btn--open" href="${safeUrl}" target="_blank" rel="noopener noreferrer" title="Open in new tab">` +
              `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>` +
            `</a>` +
            `<button class="nb-live-embed__btn nb-live-embed__btn--remove" title="Remove embed">` +
              `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` +
            `</button>` +
          `</div>` +
        `</div>` +
        `<div class="nb-live-embed__frame-wrap">` +
          `<iframe class="nb-live-embed__iframe" src="${escapeAttr(iframeSrc)}" loading="eager" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; display-capture; fullscreen; geolocation; webgl; xr-spatial-tracking" allowfullscreen></iframe>` +
        `</div>` +
        `<div class="nb-live-embed__resize-handle" title="Drag to resize height"></div>` +
      `</div><br>`
    );
  }

  function buildDirectVideoEmbedHTML(url, title) {
    const safeUrl = escapeAttr(url);
    const safeTitle = escapeHtml((title || 'Video').slice(0, 120));

    return (
      `<div class="nb-live-embed nb-live-embed--video" contenteditable="false" data-url="${safeUrl}">` +
        `<div class="nb-live-embed__bar">` +
          `<span class="nb-live-embed__icon">🎬</span>` +
          `<span class="nb-live-embed__info">` +
            `<span class="nb-live-embed__title">${safeTitle}</span>` +
            `<span class="nb-live-embed__domain">HTML5 Video</span>` +
          `</span>` +
          `<button class="nb-live-embed__btn nb-live-embed__btn--reload" title="Reload video">` +
            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>` +
          `</button>` +
          `<button class="nb-live-embed__btn nb-live-embed__btn--expand" title="Expand / Fullscreen">` +
            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>` +
          `</button>` +
          `<a class="nb-live-embed__btn nb-live-embed__btn--open" href="${safeUrl}" target="_blank" rel="noopener noreferrer" title="Open in new tab">` +
            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>` +
          `</a>` +
          `<button class="nb-live-embed__btn nb-live-embed__btn--remove" title="Remove embed">` +
            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` +
          `</button>` +
        `</div>` +
        `<div class="nb-live-embed__frame-wrap">` +
          `<video class="nb-live-embed__video" src="${safeUrl}" controls preload="metadata" playsinline></video>` +
        `</div>` +
      `</div><br>`
    );
  }

  async function buildPreviewCardHTML(url) {
    const safeUrl = escapeAttr(url);
    let title = url;
    let desc = '';
    let image = '';
    let domain = '';
    try {
      domain = new URL(url).hostname.replace(/^www\./, '');
      title = domain;
    } catch (e) {}

    try {
      const res = await fetch('/api/link-preview?url=' + encodeURIComponent(url));
      const data = await res.json();
      if (data && data.ok) {
        title = data.title || title;
        desc = data.description || '';
        image = data.image || '';
        domain = data.domain || domain;
      }
    } catch (e) {}

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(desc);
    const safeDomain = escapeHtml(domain);

    const thumbHtml = image
      ? `<img class="nb-link-card__thumb" src="${escapeAttr(image)}" alt="">`
      : `<span class="nb-link-card__thumb--placeholder">📰</span>`;
    const descHtml = safeDesc ? `<div class="nb-link-card__desc">${safeDesc}</div>` : '';

    return (
      `<a class="nb-link-card" href="${safeUrl}" target="_blank" rel="noopener noreferrer" contenteditable="false">` +
        thumbHtml +
        `<div class="nb-link-card__body">` +
          `<div class="nb-link-card__title">${safeTitle}</div>` +
          descHtml +
          `<div class="nb-link-card__domain">${safeDomain} <span class="nb-link-card__domain-dot">•</span> Preview Card</div>` +
        `</div>` +
        `<span class="nb-link-card__arrow">↗</span>` +
      `</a><br>`
    );
  }

  async function handlePaste(e, el) {
    const clipboard = e.clipboardData || window.clipboardData;
    if (!clipboard) return;
    const text = clipboard.getData('text/plain');
    const trimmed = text ? text.trim() : '';
    if (!trimmed || text.trim() !== text || !BARE_URL_RE.test(trimmed)) return; // only handle a lone URL paste
    e.preventDefault();
    activeSlot = el === rightPageEl ? 'right' : 'left';
    activePageEl = el;
    const html = await buildUrlInsertHTML(trimmed);
    document.execCommand('insertHTML', false, html);
    wireEmbedResizers(el);
    syncSpreadFromDOM();
    scheduleSave();
  }

  // Auto-link a URL you just typed, the moment you hit space/enter after it
  // — mirrors how most rich text editors behave. Best-effort: any failure
  // just leaves the plain text alone.
  function linkifyRecentTyping(el) {
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      if (!el.contains(range.startContainer)) return;
      const node = range.startContainer;
      if (node.nodeType !== Node.TEXT_NODE) return;
      if (node.parentElement && node.parentElement.closest('a')) return;

      const text = node.textContent;
      const before = text.slice(0, range.startOffset);
      const m = before.match(/(https?:\/\/\S+)(\s)$/i);
      if (!m) return;
      const urlText = m[1];
      const urlStart = before.length - m[0].length;

      const a = document.createElement('a');
      a.href = urlText;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = urlText;

      const wrapRange = document.createRange();
      wrapRange.setStart(node, urlStart);
      wrapRange.setEnd(node, urlStart + urlText.length);
      wrapRange.deleteContents();
      wrapRange.insertNode(a);

      const after = document.createRange();
      after.setStartAfter(a);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
    } catch (err) {
      /* non-critical enhancement — ignore */
    }
  }

  linkBtn.addEventListener('click', async () => {
    activePageEl.focus();
    restoreSelection();
    const sel = window.getSelection();
    const hasSelection = !!(sel && !sel.isCollapsed && activePageEl.contains(sel.anchorNode));

    const url = prompt('Paste or type a URL to insert:');
    if (!url) return;
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      alert('Please enter a full URL starting with http:// or https://');
      return;
    }

    activePageEl.focus();
    restoreSelection();
    if (hasSelection) {
      document.execCommand('createLink', false, trimmed);
      try {
        activePageEl.querySelectorAll(`a[href="${trimmed.replace(/"/g, '\\"')}"]`).forEach((a) => {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        });
      } catch (err) {
        /* ignore */
      }
    } else {
      const html = await buildUrlInsertHTML(trimmed);
      document.execCommand('insertHTML', false, html);
      wireEmbedResizers(activePageEl);
    }
    syncSpreadFromDOM();
    scheduleSave();
  });

  // ---------- Search & Embed Modal wiring ----------
  const searchEmbedBtn = document.getElementById('searchEmbedBtn');
  const searchModal = document.getElementById('searchModal');
  const searchBackdrop = document.getElementById('searchBackdrop');
  const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
  const cancelSearchModalBtn = document.getElementById('cancelSearchModalBtn');
  const searchForm = document.getElementById('searchForm');
  const searchQueryInput = document.getElementById('searchQueryInput');
  const searchResultsWrapper = document.getElementById('searchResultsWrapper');
  const searchResultsList = document.getElementById('searchResultsList');

  function openSearchModal() {
    if (!searchModal) return;
    searchModal.hidden = false;
    searchQueryInput.value = '';
    searchResultsWrapper.hidden = true;
    searchResultsList.innerHTML = '';
    setTimeout(() => searchQueryInput.focus(), 50);
  }

  function closeSearchModal() {
    if (!searchModal) return;
    searchModal.hidden = true;
  }

  if (searchEmbedBtn) searchEmbedBtn.addEventListener('click', openSearchModal);
  if (closeSearchModalBtn) closeSearchModalBtn.addEventListener('click', closeSearchModal);
  if (cancelSearchModalBtn) cancelSearchModalBtn.addEventListener('click', closeSearchModal);
  if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearchModal);

  // Quick chips
  document.querySelectorAll('.quick-chip').forEach(chip => {
    chip.addEventListener('click', async () => {
      const url = chip.dataset.url;
      if (!url) return;
      closeSearchModal();
      activePageEl.focus();
      restoreSelection();
      const html = await buildUrlInsertHTML(url);
      document.execCommand('insertHTML', false, html);
      wireEmbedResizers(activePageEl);
      syncSpreadFromDOM();
      scheduleSave();
    });
  });

  if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = searchQueryInput.value.trim();
      if (!query) return;

      // If user entered a direct URL, embed it immediately
      if (/^https?:\/\//i.test(query)) {
        closeSearchModal();
        activePageEl.focus();
        restoreSelection();
        const html = await buildUrlInsertHTML(query);
        document.execCommand('insertHTML', false, html);
        wireEmbedResizers(activePageEl);
        syncSpreadFromDOM();
        scheduleSave();
        return;
      }

      // Otherwise, perform live web search
      searchResultsWrapper.hidden = false;
      searchResultsList.innerHTML = '<div style="color: var(--brass); padding: 10px;">Searching web...</div>';

      try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(query));
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.results) && data.results.length > 0) {
          searchResultsList.innerHTML = '';
          data.results.forEach(item => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerHTML = `
              <div class="search-result-title">${escapeHtml(item.title)}</div>
              <div class="search-result-snippet">${escapeHtml(item.snippet || item.url)}</div>
              <div class="search-result-actions">
                <button type="button" class="search-action-btn btn-embed-live" data-url="${escapeAttr(item.url)}">🌐 Embed Live Web</button>
                <button type="button" class="search-action-btn btn-embed-preview" data-url="${escapeAttr(item.url)}">📰 Embed Preview</button>
                <a href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer" class="search-action-btn">↗ Open</a>
              </div>
            `;
            searchResultsList.appendChild(div);
          });

          // Wire action buttons
          searchResultsList.querySelectorAll('.btn-embed-live').forEach(btn => {
            btn.addEventListener('click', async () => {
              const url = btn.dataset.url;
              closeSearchModal();
              activePageEl.focus();
              restoreSelection();
              const html = await buildUrlInsertHTML(url);
              document.execCommand('insertHTML', false, html);
              wireEmbedResizers(activePageEl);
              syncSpreadFromDOM();
              scheduleSave();
            });
          });

          searchResultsList.querySelectorAll('.btn-embed-preview').forEach(btn => {
            btn.addEventListener('click', async () => {
              const url = btn.dataset.url;
              closeSearchModal();
              activePageEl.focus();
              restoreSelection();
              const html = await buildPreviewCardHTML(url);
              document.execCommand('insertHTML', false, html);
              wireEmbedResizers(activePageEl);
              syncSpreadFromDOM();
              scheduleSave();
            });
          });
        } else {
          searchResultsList.innerHTML = `
            <div style="padding: 12px; color: var(--parchment-light);">
              No direct instant answers found. 
              <button type="button" class="brass-btn" style="margin-top: 8px; display: block;" id="embedDirectSearchBtn">
                Embed Search for "${escapeHtml(query)}"
              </button>
            </div>
          `;
          const embedDirectBtn = document.getElementById('embedDirectSearchBtn');
          if (embedDirectBtn) {
            embedDirectBtn.addEventListener('click', async () => {
              const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
              closeSearchModal();
              activePageEl.focus();
              restoreSelection();
              const html = await buildUrlInsertHTML(searchUrl);
              document.execCommand('insertHTML', false, html);
              wireEmbedResizers(activePageEl);
              syncSpreadFromDOM();
              scheduleSave();
            });
          }
        }
      } catch (err) {
        searchResultsList.innerHTML = '<div style="color: var(--danger); padding: 10px;">Search request failed. Please check network.</div>';
      }
    });
  }

  // ---------- title + autosave ----------
  if (titleInput) {
    titleInput.addEventListener('input', () => {
      if (notebook) notebook.title = titleInput.value;
      if (currentBookTitle) currentBookTitle.textContent = titleInput.value;
      scheduleSave();
    });
  }

  // If the server's in-memory key gets cleared out from under us — the
  // process restarted, or the notebook was locked from another tab — every
  // authenticated call starts 401ing. Rather than leaving the UI stuck,
  // bounce back to the password screen. Content already on disk is safe;
  // only unsaved edits since the last autosave could be lost, so we warn.
  let bounced = false;
  function handleSessionLocked() {
    if (bounced) return;
    bounced = true;
    clearTimeout(saveTimer);
    alert('This notebook got locked (often just a server restart). Anything already saved is safe — click OK to unlock again.');
    window.location.reload();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveStatus.textContent = 'Editing…';
    saveStatus.classList.add('saving');
    saveTimer = setTimeout(saveNotebook, 1200);
  }

  async function saveNotebook() {
    syncSpreadFromDOM();
    saveStatus.textContent = 'Saving…';
    try {
      const res = await fetch('/api/notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebook }),
      });
      if (res.status === 401) return handleSessionLocked();
      if (!res.ok) throw new Error('save failed');
      saveStatus.textContent = 'Saved';
      saveStatus.classList.remove('saving');
    } catch (err) {
      saveStatus.textContent = 'Save failed — retrying';
      saveTimer = setTimeout(saveNotebook, 4000);
    }
  }

  // ---------- lock / settings ----------
  lockBtn.addEventListener('click', async () => {
    await saveNotebook();
    await fetch('/api/lock', { method: 'POST' });
    window.location.reload();
  });

  settingsBtn.addEventListener('click', () => {
    settingsMsg.textContent = '';
    newPasswordInput.value = '';
    newPasswordConfirm.value = '';
    settingsDrawer.hidden = false;
  });
  closeSettingsBtn.addEventListener('click', () => {
    settingsDrawer.hidden = true;
  });

  changePasswordBtn.addEventListener('click', async () => {
    settingsMsg.textContent = '';
    const pw = newPasswordInput.value;
    if (pw.length < 4) {
      settingsMsg.textContent = 'Use at least 4 characters.';
      return;
    }
    if (pw !== newPasswordConfirm.value) {
      settingsMsg.textContent = 'Passwords do not match.';
      return;
    }
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: pw }),
      });
      if (res.status === 401) return handleSessionLocked();
      const data = await res.json();
      if (!res.ok) {
        settingsMsg.textContent = data.error || 'Could not change password.';
        return;
      }
      settingsMsg.textContent = 'Password changed.';
      newPasswordInput.value = '';
      newPasswordConfirm.value = '';
    } catch (err) {
      settingsMsg.textContent = 'Could not reach the server.';
    }
  });

  init();
})();
