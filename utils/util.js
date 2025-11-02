(function() {
  'use strict';

  let popupWindow = null;
  let intervalId = null;

  function createEmbeddedContainer() {
    const container = document.createElement('div');
    container.id = 'player-rows-container';
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.zIndex = '9999';
    container.style.maxHeight = '40vh';
    container.style.overflowY = 'auto';
    container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    container.style.borderRadius = '5px';
    container.style.padding = '5px';
    container.style.width = '250px';
    container.style.display = 'none';
    container.style.cursor = 'move';
    container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    document.body.appendChild(container);

    // Draggability logic (same as original script)
    let isDragging = false;
    let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

    container.addEventListener("mousedown", dragStart, false);
    document.addEventListener("mouseup", dragEnd, false);
    document.addEventListener("mousemove", drag, false);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === container) {
            isDragging = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, container);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    return container;
  }

  function createToggleButton() {
    const button = document.createElement('button');
    button.textContent = '👁️ Spectators';
    button.style.position = 'fixed';
    button.style.bottom = '20px';  // Changed from top to bottom
    button.style.right = '20px';   // Changed from left to right
    button.style.zIndex = '9999';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = 'rgba(106,50,198,0.8)';  // Slightly transparent
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '50px';  // Rounded button
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';  // Add shadow for depth
    button.style.transition = 'transform 0.2s, background-color 0.2s';  // Smooth transition

    // Hover and click effects
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.05)';
        button.style.backgroundColor = 'rgba(126,70,218,0.9)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.backgroundColor = 'rgba(106,50,198,0.8)';
    });

    button.addEventListener('mousedown', () => {
        button.style.transform = 'scale(0.95)';
    });

    button.addEventListener('mouseup', () => {
        button.style.transform = 'scale(1)';
    });

    button.onclick = function() {
        const container = document.getElementById('player-rows-container');
        if (container) {
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
        }
    };

    document.body.appendChild(button);
}

  function updateSpectatorList() {
    const container = document.getElementById('player-rows-container');
    const S_nick = parent.Texture.customSkinMap;
    const spectators = [];

    // Collect spectators from custom skin map
    S_nick.forEach((skinURL, key) => {
      let nick = key;
      if (!nick || nick.trim() === "") return;

      // Remove trailing numbers and whitespace
      nick = nick.replace(/[0-9]+$/, '').replace(/[\s\u200B-\u200D\uFEFF]/g, '');

      spectators.push({
        _nick: nick,
        _skinURL: skinURL
      });
    });

    // Update container if spectators have changed
    if (spectators.length > 0) {
      container.innerHTML = '';
      const specboard = document.createElement("div");
      specboard.style.display = "flex";
      specboard.style.flexDirection = "column";
      specboard.style.gap = "10px";
      specboard.style.padding = "10px";

      spectators.forEach(function(item) {
        const playerContainer = document.createElement("div");
        playerContainer.style.display = "flex";
        playerContainer.style.alignItems = "center";
        playerContainer.style.padding = "10px";
        playerContainer.style.border = "5px solid #FF1493";
        playerContainer.style.borderRadius = "5px";
        playerContainer.style.backgroundColor = "rgba(255, 20, 147, 0.1)";
        playerContainer.style.marginBottom = "5px";

        // Image container
        const imgContainer = document.createElement("div");
        imgContainer.style.width = "50px";
        imgContainer.style.flexShrink = "0";

        const img = document.createElement("img");
        img.src = item._skinURL || '';
        img.style.width = "50px";
        img.style.height = "50px";
        img.style.borderRadius = "5px";
        img.style.cursor = "pointer";

        // Popup image on click
        img.onclick = function() {
          const popup = document.createElement("div");
          popup.style.position = "fixed";
          popup.style.top = "50%";
          popup.style.left = "50%";
          popup.style.transform = "translate(-50%, -50%)";
          popup.style.zIndex = "10000";
          popup.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
          popup.style.padding = "20px";
          popup.style.borderRadius = "10px";

          const popupImg = document.createElement("img");
          popupImg.src = item._skinURL;
          popupImg.style.width = "512px";
          popupImg.style.height = "512px";

          popup.appendChild(popupImg);
          document.body.appendChild(popup);

          popup.onclick = function() {
            document.body.removeChild(popup);
          };
        };

        imgContainer.appendChild(img);
        playerContainer.appendChild(imgContainer);

        // Nick container
        const nickContainer = document.createElement("div");
        nickContainer.style.marginLeft = "10px";
        nickContainer.style.flex = "1";

        const nickSpan = document.createElement("span");
        nickSpan.textContent = item._nick;
        nickSpan.style.color = "white";
        nickSpan.style.fontSize = "14px";
        nickSpan.style.fontWeight = "bold";

        nickContainer.appendChild(nickSpan);
        playerContainer.appendChild(nickContainer);

        specboard.appendChild(playerContainer);
      });

      container.appendChild(specboard);
    }
  }

  function createStartButton() {
    let button = document.createElement("button");
    button.textContent = "Spectators";
    button.style.color = "white";
    button.style.fontWeight = "bold";
    button.className = "input-button";
    button.style.textShadow = "1px 1px 1px black";

    let isRunning = false;

    button.onclick = function () {
      if (!isRunning) {
        button.style.backgroundColor = "rgba(106,50,198,0.75)";

        intervalId = setInterval(updateSpectatorList, 3000);

        isRunning = true;
        toastr.info("Spectators Tracking Started 🟢", {
          className: "toast-custom-bg",
        });
      } else {
        button.style.backgroundColor = "rgba(55,55,197,0.75)";
        clearInterval(intervalId);
        isRunning = false;
        toastr.info("Spectators Tracking Stopped 🔴", {
          className: "toast-custom-bg",
        });
      }
    };

    const targetDiv = document.querySelector(".fcols.grow.hinherit");
    if (targetDiv) {
      targetDiv.appendChild(button);
    }
  }

  setTimeout(function() {
    createStartButton();
    createToggleButton();
    createEmbeddedContainer();
}, 5000);

})();
