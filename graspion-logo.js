const GRASPION_COLORS = { gradientStart: '#0E3D63', gradientEnd: '#6BAA4C' };

function graspionIconHTML(size) {
  size = size || 32;
  return '<div style="width:' + size + 'px; height:' + size + 'px; border-radius:' + Math.round(size*0.28) + 'px; background:linear-gradient(135deg,' + GRASPION_COLORS.gradientStart + ',' + GRASPION_COLORS.gradientEnd + '); display:flex; align-items:center; justify-content:center; font-size:' + Math.round(size*0.5) + 'px; font-weight:900; color:#fff;">G</div>';
}

function graspionFullLogoHTML(textColor, fontSize, solidMode) {
  textColor = textColor || '#1e1b3a';
  fontSize = fontSize || 20;
  var ionStyle = solidMode
    ? 'color:' + textColor + ';'
    : 'background:linear-gradient(90deg,' + GRASPION_COLORS.gradientStart + ',' + GRASPION_COLORS.gradientEnd + '); -webkit-background-clip:text; background-clip:text; color:transparent;';
  return '<div style="display:flex; align-items:center; gap:8px;">' + graspionIconHTML(Math.round(fontSize * 1.6)) +
    '<div style="font-size:' + fontSize + 'px; font-weight:900; color:' + textColor + ';">Grasp<span style="' + ionStyle + '">ion</span></div></div>';
}

function graspionTextLogoHTML(fontSize, textColor, solidMode) {
  fontSize = fontSize || 22;
  textColor = textColor || '#1e1b3a';
  var ionStyle = solidMode
    ? 'color:' + textColor + ';'
    : 'background:linear-gradient(90deg,' + GRASPION_COLORS.gradientStart + ',' + GRASPION_COLORS.gradientEnd + '); -webkit-background-clip:text; background-clip:text; color:transparent;';
  return '<div style="font-size:' + fontSize + 'px; font-weight:900; color:' + textColor + ';">Grasp<span style="' + ionStyle + '">ion</span></div>';
}

function renderAllGraspionLogos() {
  document.querySelectorAll('[data-graspion-logo="full"]').forEach(function(el) {
    var customColor = el.getAttribute('data-color');
    el.innerHTML = graspionFullLogoHTML(customColor || '#1e1b3a', el.getAttribute('data-size') || 20, !!customColor);
  });
  document.querySelectorAll('[data-graspion-logo="icon"]').forEach(function(el) {
    el.innerHTML = graspionIconHTML(el.getAttribute('data-size') || 32);
  });
  document.querySelectorAll('[data-graspion-logo="text"]').forEach(function(el) {
    var customColor = el.getAttribute('data-color');
    el.innerHTML = graspionTextLogoHTML(el.getAttribute('data-size') || 22, customColor, !!customColor);
  });
}

document.addEventListener('DOMContentLoaded', renderAllGraspionLogos);
