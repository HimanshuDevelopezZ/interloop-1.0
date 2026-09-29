/* ==========================================================================
   INTERLOOP LOGISTICS - SIMPLE QUOTE FORM (WhatsApp Redirect)
   ========================================================================== */

(function() {
  'use strict';

  let uploadedFiles = [];

  document.addEventListener('DOMContentLoaded', () => {
    initForm();
    setupFileDropzone();
  });

  function initForm() {
    const form = document.getElementById('quoteSimpleForm');
    const msgContainer = document.getElementById('formMessageContainer');
    
    if (form) {
      // Custom validation for error messages
      form.addEventListener('invalid', function(e) {
        e.preventDefault();
        if (msgContainer) {
          msgContainer.style.display = 'block';
          msgContainer.style.backgroundColor = '#fde8e8';
          msgContainer.style.color = '#d9534f';
          msgContainer.innerText = 'Error: Please fill in all required fields (*).';
        }
      }, true);

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
          submitToWhatsApp();
          
          if (msgContainer) {
            msgContainer.style.display = 'block';
            msgContainer.style.backgroundColor = '#e6f9f2';
            msgContainer.style.color = '#18c58b';
            msgContainer.innerText = 'Success! Redirecting you to WhatsApp...';
            
            setTimeout(() => {
              msgContainer.style.display = 'none';
              form.reset();
              if(window.uploadedFiles) window.uploadedFiles = [];
              const fileList = document.getElementById('quoteFileList');
              if(fileList) fileList.innerHTML = '';
            }, 5000);
          }
        } catch (error) {
          if (msgContainer) {
            msgContainer.style.display = 'block';
            msgContainer.style.backgroundColor = '#fde8e8';
            msgContainer.style.color = '#d9534f';
            msgContainer.innerText = 'Error: Something went wrong. Please try again.';
          }
        }
      });
    }
  }

  function setupFileDropzone() {
    const dropzone = document.getElementById('quoteDropzone');
    const fileInput = document.getElementById('quoteFileInput');
    const fileList = document.getElementById('quoteFileList');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    });

    function handleFiles(files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        uploadedFiles.push({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB'
        });
      }
      renderFileList();
    }

    function renderFileList() {
      if (!fileList) return;
      fileList.innerHTML = '';
      uploadedFiles.forEach((file, index) => {
        const card = document.createElement('div');
        card.className = 'file-preview-card';
        card.innerHTML = `
          <div class="file-name-truncate" title="${file.name}">📄 ${file.name}</div>
          <span style="font-size:11px;color:#60716D;">${file.size}</span>
          <button type="button" class="file-remove-btn" data-index="${index}">✕</button>
        `;
        fileList.appendChild(card);
      });

      const removeBtns = fileList.querySelectorAll('.file-remove-btn');
      removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.index, 10);
          uploadedFiles.splice(idx, 1);
          renderFileList();
        });
      });
    }
  }

  function submitToWhatsApp() {
    const pickup = (document.getElementById('pickupAddress').value || '').trim();
    const delivery = (document.getElementById('deliveryAddress').value || '').trim();
    const name = (document.getElementById('custFullName').value || '').trim();
    const contact = (document.getElementById('custContact').value || '').trim();
    const length = (document.getElementById('dimLength').value || '').trim();
    const width = (document.getElementById('dimWidth').value || '').trim();
    const height = (document.getElementById('dimHeight').value || '').trim();
    const weight = (document.getElementById('dimWeight').value || '').trim();
    const material = (document.getElementById('materialPacking').value || '').trim();

    const dims = [length, width, height].filter(v => v).join(' × ');

    let msg = `*📦 Freight Quote Request*\n\n`;
    msg += `*Full Name:* ${name}\n`;
    msg += `*Contact:* ${contact}\n\n`;
    msg += `*Pickup Address:*\n${pickup}\n\n`;
    msg += `*Delivery Address:*\n${delivery}\n\n`;
    msg += `*Freight Dimensions (L×W×H):* ${dims ? dims + ' cm' : 'Not provided'}\n`;
    msg += `*Weight:* ${weight ? weight + ' kg' : 'Not provided'}\n`;
    msg += `*Material & Packing:* ${material || 'Not provided'}\n`;

    if (uploadedFiles.length > 0) {
      const fileNames = uploadedFiles.map(f => f.name).join(', ');
      msg += `\n*📎 Photos:* ${uploadedFiles.length} file(s) — ${fileNames}\n_(Will send in this chat)_\n`;
    }

    const whatsappUrl = `https://wa.me/61468201066?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
  }

  // Public API stub — prevents errors from service card links
  window.InterloopQuoteWizard = {
    setFreightType: function() {
      const section = document.getElementById('quote-section');
      if (section) {
        const topOffset = section.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: topOffset, behavior: 'smooth' });
      }
    }
  };

})();
