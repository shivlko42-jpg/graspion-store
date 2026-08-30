const GRASPION_COLORS = { gradientStart: '#1e1b3a', gradientMid: '#7c3aed', gradientEnd: '#ec4899', wordmarkStart: '#7c3aed', wordmarkEnd: '#ec4899' };

function graspionIconHTML(size) {
  size = size || 32;
  return '<div style="width:' + size + 'px; height:' + size + 'px; border-radius:' + Math.round(size*0.28) + 'px; background:linear-gradient(160deg,' + GRASPION_COLORS.gradientStart + ' 0%,' + GRASPION_COLORS.gradientMid + ' 55%,' + GRASPION_COLORS.gradientEnd + ' 100%); display:flex; align-items:center; justify-content:center; font-size:' + Math.round(size*0.5) + 'px; font-weight:900; color:#fff;">G</div>';
}

function graspionFullLogoHTML(textColor, fontSize, solidMode) {
  textColor = textColor || '#1e1b3a';
  fontSize = fontSize || 20;
  var wordStyle = solidMode
    ? 'color:' + textColor + ';'
    : 'background:linear-gradient(90deg,' + GRASPION_COLORS.wordmarkStart + ',' + GRASPION_COLORS.wordmarkEnd + '); -webkit-background-clip:text; background-clip:text; color:transparent;';
  return '<div style="display:flex; align-items:center; gap:8px;">' + graspionIconHTML(Math.round(fontSize * 1.6)) +
    '<div style="font-size:' + fontSize + 'px; font-weight:900; ' + wordStyle + '">Graspion</div></div>';
}

function graspionTextLogoHTML(fontSize, textColor, solidMode) {
  fontSize = fontSize || 22;
  textColor = textColor || '#1e1b3a';
  var wordStyle = solidMode
    ? 'color:' + textColor + ';'
    : 'background:linear-gradient(90deg,' + GRASPION_COLORS.wordmarkStart + ',' + GRASPION_COLORS.wordmarkEnd + '); -webkit-background-clip:text; background-clip:text; color:transparent;';
  return '<div style="font-size:' + fontSize + 'px; font-weight:900; ' + wordStyle + '">Graspion</div>';
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
