/* ==========================================================================
   INTERLOOP LOGISTICS - 12-STEP FREIGHT QUOTE ENGINE
   ========================================================================== */

(function() {
  'use strict';

  const TOTAL_STEPS = 12;

  // Step Titles and Descriptions
  const STEP_METADATA = [
    { title: "Customer Details", desc: "Who should we prepare this freight quotation for?" },
    { title: "What Are You Moving?", desc: "Tell us about the freight and nature of goods." },
    { title: "Dimensions & Weight", desc: "Provide approximate dimensions and total weight." },
    { title: "Pickup Details", desc: "Where should our transport team collect the freight?" },
    { title: "Delivery Details", desc: "Where is the final delivery destination?" },
    { title: "Loading Facilities", desc: "Are loading facilities available at the collection site?" },
    { title: "Unloading Facilities", desc: "Are unloading facilities available at the delivery site?" },
    { title: "Packaging Type", desc: "How is the freight prepared and packaged?" },
    { title: "Fragile Goods", desc: "Does this consignment require fragile handling?" },
    { title: "Dangerous Goods (DG)", desc: "Are these items classified under Dangerous Goods regulations?" },
    { title: "Photos & Documents", desc: "Upload photos, packaging sheets, or consignment specs." },
    { title: "Review & Submit", desc: "Review your freight request before submission." }
  ];

  // Form State
  const formState = {
    currentStep: 1,
    uploadedFiles: [],
    data: {
      fullName: '',
      companyName: '',
      email: '',
      phone: '',
      contactMethod: 'Phone',
      goodsDescription: '',
      totalQuantity: '1',
      freightType: 'General Freight',
      additionalDescription: '',
      length: '',
      width: '',
      height: '',
      weight: '',
      unknownDimensions: false,
      pickupStreet: '',
      pickupSuburb: '',
      pickupState: 'VIC',
      pickupPostcode: '',
      pickupLocationType: 'Commercial Property',
      deliveryStreet: '',
      deliverySuburb: '',
      deliveryState: 'NSW',
      deliveryPostcode: '',
      deliveryLocationType: 'Commercial Property',
      loadingAvailable: 'Yes',
      loadingOptions: [],
      unloadingAvailable: 'Yes',
      unloadingOptions: [],
      packagingType: 'Palletised',
      packingNotes: '',
      isFragile: 'No',
      fragileNotes: '',
      isDG: 'No',
      dgClass: '',
      dgUN: '',
      additionalNotes: ''
    }
  };

  // DOM Elements Cache
  let progressBar, stepCounterText, stepTitleText, stepSubtitleText;
  let prevBtn, nextBtn, submitBtn;
  let wizardCard, successPane, wizardForm;

  document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
    updateStepUI();
  });

  function initElements() {
    progressBar = document.getElementById('wizardProgressBar');
    stepCounterText = document.getElementById('wizardStepCounter');
    stepTitleText = document.getElementById('wizardStepTitle');
    stepSubtitleText = document.getElementById('wizardStepSubtitle');
    prevBtn = document.getElementById('wizardPrevBtn');
    nextBtn = document.getElementById('wizardNextBtn');
    submitBtn = document.getElementById('wizardSubmitBtn');
    wizardCard = document.getElementById('wizardCard');
    successPane = document.getElementById('wizardSuccessPane');
    wizardForm = document.getElementById('quoteMultiStepForm');
  }

  function initEventListeners() {
    // Navigation Buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (formState.currentStep > 1) {
          formState.currentStep--;
          updateStepUI();
          scrollToWizard();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
          saveCurrentStepData();
          if (formState.currentStep < TOTAL_STEPS) {
            formState.currentStep++;
            updateStepUI();
            scrollToWizard();
          }
        }
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        saveCurrentStepData();
        submitQuoteEnquiry();
      });
    }

    // Step 1: Contact Method Pills
    const contactPills = document.querySelectorAll('input[name="contactMethod"]');
    contactPills.forEach(radio => {
      radio.addEventListener('change', (e) => {
        formState.data.contactMethod = e.target.value;
      });
    });

    // Step 3: Unknown Dimensions Toggle
    const unknownDimensionsCheck = document.getElementById('unknownDimensionsCheck');
    const dimensionsInputs = document.getElementById('dimensionsInputsContainer');
    const unknownDimensionsNotice = document.getElementById('unknownDimensionsNotice');
    if (unknownDimensionsCheck) {
      unknownDimensionsCheck.addEventListener('change', (e) => {
        formState.data.unknownDimensions = e.target.checked;
        if (e.target.checked) {
          dimensionsInputs.style.opacity = '0.5';
          unknownDimensionsNotice.style.display = 'flex';
        } else {
          dimensionsInputs.style.opacity = '1';
          unknownDimensionsNotice.style.display = 'none';
        }
      });
    }

    // Step 6: Loading Facilities Toggle
    const loadingRadios = document.querySelectorAll('input[name="loadingAvailable"]');
    const loadingConditional = document.getElementById('loadingConditionalBox');
    loadingRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        formState.data.loadingAvailable = e.target.value;
        if (e.target.value === 'Yes') {
          loadingConditional.classList.add('visible');
        } else {
          loadingConditional.classList.remove('visible');
        }
      });
    });

    // Step 7: Unloading Facilities Toggle
    const unloadingRadios = document.querySelectorAll('input[name="unloadingAvailable"]');
    const unloadingConditional = document.getElementById('unloadingConditionalBox');
    unloadingRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        formState.data.unloadingAvailable = e.target.value;
        if (e.target.value === 'Yes') {
          unloadingConditional.classList.add('visible');
        } else {
          unloadingConditional.classList.remove('visible');
        }
      });
    });

    // Step 8: Packaging Type Cards
    const packCards = document.querySelectorAll('.pack-type-card');
    packCards.forEach(card => {
      card.addEventListener('click', () => {
        packCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        formState.data.packagingType = card.dataset.value;
      });
    });

    // Step 9: Fragile Goods Toggle
    const fragileRadios = document.querySelectorAll('input[name="isFragile"]');
    const fragileConditional = document.getElementById('fragileConditionalBox');
    fragileRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        formState.data.isFragile = e.target.value;
        if (e.target.value === 'Yes') {
          fragileConditional.classList.add('visible');
        } else {
          fragileConditional.classList.remove('visible');
        }
      });
    });

    // Step 10: Dangerous Goods Toggle
    const dgRadios = document.querySelectorAll('input[name="isDG"]');
    const dgConditional = document.getElementById('dgConditionalBox');
    dgRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        formState.data.isDG = e.target.value;
        if (e.target.value === 'Yes') {
          dgConditional.classList.add('visible');
        } else {
          dgConditional.classList.remove('visible');
        }
      });
    });

    // Step 11: File Drag & Drop
    setupFileDropzone();

    // Reset button in success screen
    const resetBtn = document.getElementById('resetWizardBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        formState.currentStep = 1;
        successPane.classList.remove('active');
        wizardCard.style.display = 'block';
        updateStepUI();
        scrollToWizard();
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
        formState.uploadedFiles.push({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB'
        });
      }
      renderFileList();
    }

    function renderFileList() {
      if (!fileList) return;
      fileList.innerHTML = '';
      formState.uploadedFiles.forEach((file, index) => {
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
          formState.uploadedFiles.splice(idx, 1);
          renderFileList();
        });
      });
    }
  }

  function validateCurrentStep() {
    clearErrors();
    let isValid = true;
    const step = formState.currentStep;

    if (step === 1) {
      const name = document.getElementById('custFullName');
      const email = document.getElementById('custEmail');
      const phone = document.getElementById('custPhone');

      if (!name.value.trim()) {
        showError(name, 'Full Name is required');
        isValid = false;
      }
      if (!email.value.trim() || !validateEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
      }
      if (!phone.value.trim()) {
        showError(phone, 'Phone number is required');
        isValid = false;
      }
    } else if (step === 2) {
      const goods = document.getElementById('goodsDescription');
      if (!goods.value.trim()) {
        showError(goods, 'Please specify the goods description');
        isValid = false;
      }
    } else if (step === 4) {
      const street = document.getElementById('pickupStreet');
      const suburb = document.getElementById('pickupSuburb');
      const postcode = document.getElementById('pickupPostcode');

      if (!street.value.trim()) {
        showError(street, 'Pickup street address is required');
        isValid = false;
      }
      if (!suburb.value.trim()) {
        showError(suburb, 'Pickup suburb is required');
        isValid = false;
      }
      if (!postcode.value.trim()) {
        showError(postcode, 'Postcode is required');
        isValid = false;
      }
    } else if (step === 5) {
      const street = document.getElementById('deliveryStreet');
      const suburb = document.getElementById('deliverySuburb');
      const postcode = document.getElementById('deliveryPostcode');

      if (!street.value.trim()) {
        showError(street, 'Delivery street address is required');
        isValid = false;
      }
      if (!suburb.value.trim()) {
        showError(suburb, 'Delivery suburb is required');
        isValid = false;
      }
      if (!postcode.value.trim()) {
        showError(postcode, 'Postcode is required');
        isValid = false;
      }
    }

    return isValid;
  }

  function showError(inputEl, message) {
    inputEl.classList.add('is-invalid');
    const parent = inputEl.parentElement;
    let err = parent.querySelector('.form-error-msg');
    if (err) {
      err.textContent = message;
      err.style.display = 'block';
    }
  }

  function clearErrors() {
    const invalidInputs = document.querySelectorAll('.form-input.is-invalid, .form-select.is-invalid');
    invalidInputs.forEach(input => input.classList.remove('is-invalid'));
    const msgs = document.querySelectorAll('.form-error-msg');
    msgs.forEach(m => m.style.display = 'none');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function saveCurrentStepData() {
    const step = formState.currentStep;
    if (step === 1) {
      formState.data.fullName = document.getElementById('custFullName').value;
      formState.data.companyName = document.getElementById('custCompany').value;
      formState.data.email = document.getElementById('custEmail').value;
      formState.data.phone = document.getElementById('custPhone').value;
    } else if (step === 2) {
      formState.data.goodsDescription = document.getElementById('goodsDescription').value;
      formState.data.totalQuantity = document.getElementById('goodsQuantity').value;
      formState.data.freightType = document.getElementById('freightTypeSelect').value;
      formState.data.additionalDescription = document.getElementById('additionalDescription').value;
    } else if (step === 3) {
      formState.data.length = document.getElementById('dimLength').value;
      formState.data.width = document.getElementById('dimWidth').value;
      formState.data.height = document.getElementById('dimHeight').value;
      formState.data.weight = document.getElementById('dimWeight').value;
    } else if (step === 4) {
      formState.data.pickupStreet = document.getElementById('pickupStreet').value;
      formState.data.pickupSuburb = document.getElementById('pickupSuburb').value;
      formState.data.pickupState = document.getElementById('pickupState').value;
      formState.data.pickupPostcode = document.getElementById('pickupPostcode').value;
      formState.data.pickupLocationType = document.getElementById('pickupLocationType').value;
    } else if (step === 5) {
      formState.data.deliveryStreet = document.getElementById('deliveryStreet').value;
      formState.data.deliverySuburb = document.getElementById('deliverySuburb').value;
      formState.data.deliveryState = document.getElementById('deliveryState').value;
      formState.data.deliveryPostcode = document.getElementById('deliveryPostcode').value;
      formState.data.deliveryLocationType = document.getElementById('deliveryLocationType').value;
    } else if (step === 6) {
      const checkedBoxes = document.querySelectorAll('#loadingConditionalBox input[type="checkbox"]:checked');
      formState.data.loadingOptions = Array.from(checkedBoxes).map(cb => cb.value);
    } else if (step === 7) {
      const checkedBoxes = document.querySelectorAll('#unloadingConditionalBox input[type="checkbox"]:checked');
      formState.data.unloadingOptions = Array.from(checkedBoxes).map(cb => cb.value);
    } else if (step === 8) {
      formState.data.packingNotes = document.getElementById('packingNotes').value;
    } else if (step === 9) {
      formState.data.fragileNotes = document.getElementById('fragileNotes').value;
    } else if (step === 10) {
      formState.data.dgClass = document.getElementById('dgClassInput').value;
      formState.data.dgUN = document.getElementById('dgUNInput').value;
    } else if (step === 12) {
      formState.data.additionalNotes = document.getElementById('additionalNotesTextarea').value;
    }
  }

  function updateStepUI() {
    const step = formState.currentStep;

    // Progress Bar
    const percent = ((step / TOTAL_STEPS) * 100).toFixed(1);
    if (progressBar) progressBar.style.width = percent + '%';

    // Step Info
    if (stepCounterText) stepCounterText.textContent = `Step ${step} of ${TOTAL_STEPS}`;
    if (stepTitleText) stepTitleText.textContent = STEP_METADATA[step - 1].title;
    if (stepSubtitleText) stepSubtitleText.textContent = STEP_METADATA[step - 1].desc;

    // Toggle Panes
    const panes = document.querySelectorAll('.wizard-step-pane');
    panes.forEach(pane => {
      if (parseInt(pane.dataset.step, 10) === step) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Buttons Visibility & Hint Toggle
    const step1Hint = document.getElementById('wizardStep1Hint');
    if (prevBtn) {
      if (step === 1) {
        prevBtn.style.display = 'none';
        if (step1Hint) step1Hint.style.display = 'flex';
      } else {
        prevBtn.style.display = 'inline-flex';
        if (step1Hint) step1Hint.style.display = 'none';
      }
    }

    if (nextBtn && submitBtn) {
      if (step === TOTAL_STEPS) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
        renderReviewSummary();
      } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
      }
    }
  }

  function renderReviewSummary() {
    const summaryContainer = document.getElementById('reviewSummaryContent');
    if (!summaryContainer) return;

    const d = formState.data;
    const filesCount = formState.uploadedFiles.length;

    summaryContainer.innerHTML = `
      <div class="review-summary-card">
        <div class="review-section-title">01. Customer Details</div>
        <div class="review-grid">
          <div class="review-item">
            <div class="review-item-label">Full Name</div>
            <div class="review-item-value">${escapeHtml(d.fullName || '—')}</div>
          </div>
          <div class="review-item">
            <div class="review-item-label">Company</div>
            <div class="review-item-value">${escapeHtml(d.companyName || 'Not specified')}</div>
          </div>
          <div class="review-item">
            <div class="review-item-label">Email</div>
            <div class="review-item-value">${escapeHtml(d.email || '—')}</div>
          </div>
          <div class="review-item">
            <div class="review-item-label">Phone & Preferred Contact</div>
            <div class="review-item-value">${escapeHtml(d.phone || '—')} (${escapeHtml(d.contactMethod)})</div>
          </div>
        </div>

        <div class="review-section-title">02. Route & Locations</div>
        <div class="review-grid">
          <div class="review-item">
            <div class="review-item-label">Pickup Location</div>
            <div class="review-item-value">${escapeHtml(d.pickupStreet)}, ${escapeHtml(d.pickupSuburb)} ${escapeHtml(d.pickupState)} ${escapeHtml(d.pickupPostcode)} (${escapeHtml(d.pickupLocationType)})</div>
          </div>
          <div class="review-item">
            <div class="review-item-label">Delivery Location</div>
            <div class="review-item-value">${escapeHtml(d.deliveryStreet)}, ${escapeHtml(d.deliverySuburb)} ${escapeHtml(d.deliveryState)} ${escapeHtml(d.deliveryPostcode)} (${escapeHtml(d.deliveryLocationType)})</div>
          </div>
        </div>

        <div class="review-section-title">03. Freight Specifications</div>
        <div class="review-grid">
          <div class="review-item">
            <div class="review-item-label">Description & Type</div>
            <div class="review-item-value">${escapeHtml(d.goodsDescription)} — ${escapeHtml(d.freightType)} (Qty: ${escapeHtml(d.totalQuantity)})</div>
          </div>
          <div class="review-item">
            <div class="review-item-label">Dimensions & Weight</div>
            <div class="review-item-value">
              ${d.unknownDimensions ? 'Dimensions to be confirmed / via photos' : `${d.length || '—'}L x ${d.width || '—'}W x ${d.height || '—'}H cm | Weight: ${d.weight || '—'} kg`}
            </div>
          </div>
          <div class="review-item">
            <div class="review-item-label">Packaging</div>
            <div class="review-item-value">${escapeHtml(d.packagingType)} ${d.packingNotes ? '— ' + escapeHtml(d.packingNotes) : ''}</div>
          </div>
          <div class="review-item">
            <div class="review-item-label">Site Facilities</div>
            <div class="review-item-value">Pickup Loading: ${escapeHtml(d.loadingAvailable)} | Delivery Unloading: ${escapeHtml(d.unloadingAvailable)}</div>
          </div>
        </div>

        <div class="review-section-title">04. Handling & Compliance</div>
        <div class="review-grid">
          <div class="review-item">
            <div class="review-item-label">Fragile Goods</div>
            <div class="review-item-value">${escapeHtml(d.isFragile)} ${d.fragileNotes ? `(${escapeHtml(d.fragileNotes)})` : ''}</div>
          </div>
          <div class="review-item">
            <div class="review-item-label">Dangerous Goods (DG)</div>
            <div class="review-item-value">${escapeHtml(d.isDG)} ${d.isDG === 'Yes' ? `(Class: ${escapeHtml(d.dgClass)}, UN: ${escapeHtml(d.dgUN)})` : ''}</div>
          </div>
          <div class="review-item">
            <div class="review-item-label">Attachments</div>
            <div class="review-item-value">${filesCount} file(s) attached</div>
          </div>
        </div>
      </div>
    `;
  }

  function submitQuoteEnquiry() {
    const randomRef = 'IL-' + Math.floor(100000 + Math.random() * 900000);
    const refCodeEl = document.getElementById('confirmedRefCode');
    if (refCodeEl) refCodeEl.textContent = randomRef;

    wizardCard.style.display = 'none';
    if (successPane) {
      successPane.classList.add('active');
    }

    scrollToWizard();

    // Trigger feedback notification toast
    if (window.InterloopApp && window.InterloopApp.showToast) {
      window.InterloopApp.showToast('Freight request submitted successfully. Reference: ' + randomRef);
    }
  }

  function scrollToWizard() {
    const section = document.getElementById('quote-section');
    if (section) {
      const topOffset = section.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Public API to preselect values from external links/cards
  window.InterloopQuoteWizard = {
    setFreightType: function(typeName) {
      const sel = document.getElementById('freightTypeSelect');
      if (sel) {
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text.toLowerCase().includes(typeName.toLowerCase())) {
            sel.selectedIndex = i;
            break;
          }
        }
      }
      formState.currentStep = 2;
      updateStepUI();
      scrollToWizard();
    }
  };

})();
