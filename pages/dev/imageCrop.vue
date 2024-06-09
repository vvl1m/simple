<script setup>
function cropImage(evt) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const shortestSide = Math.min(img.width, img.height);
        canvas.width = shortestSide;
        canvas.height = shortestSide;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          img,
          (img.width - shortestSide) / 2,
          (img.height - shortestSide) / 2,
          shortestSide,
          shortestSide,
          0,
          0,
          shortestSide,
          shortestSide
        );

        canvas.toBlob(blob => {
          const file = new File([blob], 'cropped-image.png', {type: 'image/png'});
          resolve(file);
        }, 'image/png');
      };
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(evt.target.files[0]);
  });
}

const handle = (evt) => {
    cropImage(evt).then(croppedImage => {
        const imgElement = document.createElement('img');
        imgElement.src = croppedImage;
        document.getElementById('imgOutput').innerHTML = '';
        document.getElementById('imgOutput').appendChild(imgElement);
    });
}
</script>

<template>

    <div id="main">
        <div id="testing">
            <input type="file" id="input" @change="handle">
            <div id="imgOutput"></div>
        </div>
    </div>
</template>
<style lang="scss">
    #testing {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 40px;
        #input {
            width: 100px;
            height: 70px;
        }
        #imgOutput {
            // width: 400px;
            // height: 400px;
            // background-color: aquamarine;
            margin-top: 40px;
        }
    }
</style>