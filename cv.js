(function () {
  'use strict';

  /* ── DOM references ── */
  var form        = document.getElementById('project-form');
  var tbody       = document.getElementById('projects-tbody');
  var noMsg       = document.getElementById('no-projects-msg');
  var tableBox    = document.getElementById('table-container');
  var imgInput    = document.getElementById('proj-img');
  var imgPreview  = document.getElementById('img-preview');

  /* ── Field IDs used for validation ── */
  var REQUIRED_FIELDS = [
    'proj-name',
    'proj-desc',
    'proj-url',
    'proj-tech',
    'proj-cat',
    'proj-date',
    'proj-img'
  ];

  /* ── Live image preview when a file is chosen ── */
  imgInput.addEventListener('change', function () {
    var file = this.files[0];
    clearError('proj-img');

    if (!file) {
      imgPreview.hidden = true;
      imgPreview.src = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('proj-img', 'Please select a valid image file (JPG, PNG, GIF, WebP).');
      imgPreview.hidden = true;
      imgPreview.src = '';
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      imgPreview.src = e.target.result;
      imgPreview.alt = 'Preview of selected image';
      imgPreview.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  /* ── Show / clear error helpers ── */
  function showError(fieldId, message) {
    var errEl = document.getElementById('err-' + fieldId);
    var input = document.getElementById(fieldId);
    if (errEl) { errEl.textContent = message; }
    if (input) { input.setAttribute('aria-invalid', 'true'); }
  }

  function clearError(fieldId) {
    var errEl = document.getElementById('err-' + fieldId);
    var input = document.getElementById(fieldId);
    if (errEl) { errEl.textContent = ''; }
    if (input) { input.removeAttribute('aria-invalid'); }
  }

  function clearAllErrors() {
    REQUIRED_FIELDS.forEach(clearError);
    clearError('proj-team');
  }

  /* ── URL validation ── */
  function isValidHttpUrl(str) {
    try {
      var url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  /* ── Full form validation – returns true if all valid ── */
  function validateForm() {
    var firstErrorId = null;
    var valid = true;

    function fail(fieldId, msg) {
      showError(fieldId, msg);
      if (!firstErrorId) { firstErrorId = fieldId; }
      valid = false;
    }

    /* Project name */
    var name = document.getElementById('proj-name').value.trim();
    if (!name) {
      fail('proj-name', 'Project name is required.');
    }

    /* Description */
    var desc = document.getElementById('proj-desc').value.trim();
    if (!desc) {
      fail('proj-desc', 'Description is required.');
    } else if (desc.length < 10) {
      fail('proj-desc', 'Description must be at least 10 characters long.');
    }

    /* URL */
    var url = document.getElementById('proj-url').value.trim();
    if (!url) {
      fail('proj-url', 'Project URL is required.');
    } else if (!isValidHttpUrl(url)) {
      fail('proj-url', 'Please enter a valid URL starting with http:// or https://');
    }

    /* Technologies */
    var tech = document.getElementById('proj-tech').value.trim();
    if (!tech) {
      fail('proj-tech', 'Please list at least one technology.');
    }

    /* Category */
    var cat = document.getElementById('proj-cat').value;
    if (!cat) {
      fail('proj-cat', 'Please select a category.');
    }

    /* Completion date */
    var date = document.getElementById('proj-date').value;
    if (!date) {
      fail('proj-date', 'Please select a completion date.');
    }

    /* Team size (optional – only validate if filled) */
    var teamVal = document.getElementById('proj-team').value;
    if (teamVal !== '') {
      var teamNum = parseInt(teamVal, 10);
      if (isNaN(teamNum) || teamNum < 1 || teamNum > 500) {
        fail('proj-team', 'Team size must be a number between 1 and 500.');
      }
    }

    /* Image */
    var imgFile = imgInput.files[0];
    if (!imgFile) {
      fail('proj-img', 'Please select a project thumbnail image.');
    }

    if (firstErrorId) {
      var el = document.getElementById(firstErrorId);
      if (el) { el.focus(); }
    }

    return valid;
  }

  /* ── Format YYYY-MM-DD → "DD Mon YYYY" ── */
  function formatDate(str) {
    var parts  = str.split('-');
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return parts[2] + ' ' + months[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
  }

  /* ── Insert one row into the table ── */
  function insertRow(data) {
    noMsg.hidden       = true;
    tableBox.hidden    = false;

    var tr = document.createElement('tr');

    /* Name */
    var tdName = document.createElement('td');
    tdName.textContent = data.name;
    tr.appendChild(tdName);

    /* Description */
    var tdDesc = document.createElement('td');
    tdDesc.textContent = data.desc;
    tr.appendChild(tdDesc);

    /* URL */
    var tdUrl = document.createElement('td');
    var a = document.createElement('a');
    a.href    = data.url;
    a.target  = '_blank';
    a.rel     = 'noopener noreferrer';
    a.textContent = data.url;
    tdUrl.appendChild(a);
    tr.appendChild(tdUrl);

    /* Technologies – rendered as tags */
    var tdTech = document.createElement('td');
    data.tech.split(',').forEach(function (t) {
      var tag = document.createElement('span');
      tag.className   = 'tag';
      tag.textContent = t.trim();
      tdTech.appendChild(tag);
      tdTech.appendChild(document.createTextNode(' '));
    });
    tr.appendChild(tdTech);

    /* Image thumbnail */
    var tdImg = document.createElement('td');
    var img   = document.createElement('img');
    img.src     = data.imgSrc;
    img.alt     = data.name + ' thumbnail';
    img.loading = 'lazy';
    img.width   = 64;
    img.height  = 64;
    img.className = 'thumb-img';
    tdImg.appendChild(img);
    tr.appendChild(tdImg);

    /* Date */
    var tdDate = document.createElement('td');
    tdDate.textContent = formatDate(data.date);
    tr.appendChild(tdDate);

    tbody.appendChild(tr);
  }

  /* ── Submit handler ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors();

    if (!validateForm()) { return; }

    var imgFile = imgInput.files[0];
    var reader  = new FileReader();

    reader.onload = function (ev) {
      insertRow({
        name:   document.getElementById('proj-name').value.trim(),
        desc:   document.getElementById('proj-desc').value.trim(),
        url:    document.getElementById('proj-url').value.trim(),
        tech:   document.getElementById('proj-tech').value.trim(),
        cat:    document.getElementById('proj-cat').value,
        date:   document.getElementById('proj-date').value,
        imgSrc: ev.target.result
      });

      form.reset();
      imgPreview.hidden = true;
      imgPreview.src    = '';
    };

    reader.readAsDataURL(imgFile);
  });

  /* ── Reset handler – also clears all error messages ── */
  form.addEventListener('reset', function () {
    clearAllErrors();
    imgPreview.hidden = true;
    imgPreview.src    = '';
  });

}());
