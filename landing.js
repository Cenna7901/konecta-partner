(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug') || params.get('identificador') || params.get('franqueado') || '';
    const cleanSlug = slug.trim();

    const slugBox = document.getElementById('slugBox');
    const slugValue = document.getElementById('slugValue');
    const copySlug = document.getElementById('copySlug');

    if (cleanSlug && slugBox && slugValue) {
        slugValue.textContent = cleanSlug;
        slugBox.hidden = false;
    }

    if (copySlug) {
        copySlug.addEventListener('click', async () => {
            if (!cleanSlug) return;

            try {
                await navigator.clipboard.writeText(cleanSlug);
                copySlug.textContent = 'Identificador copiado';
            } catch (error) {
                const range = document.createRange();
                range.selectNodeContents(slugValue);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                copySlug.textContent = 'Selecione e copie';
            }

            window.setTimeout(() => {
                copySlug.textContent = 'Copiar identificador';
            }, 2200);
        });
    }
})();
