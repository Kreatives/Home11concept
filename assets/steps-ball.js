(function () {
  var section = document.querySelector('#stappen.steps-list'), model = window.home11BallModel;
  if (!section || !model) return;
  var canvas = document.createElement('canvas');
  canvas.className = 'steps-ball'; canvas.setAttribute('aria-hidden', 'true');
  section.appendChild(canvas);
  var gl = canvas.getContext('webgl', {alpha:true, antialias:true, premultipliedAlpha:false});
  if (!gl) { canvas.remove(); return; }
  function shader(type, source) {
    var s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  var program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec3 position; attribute float white; uniform vec2 rotation; varying vec3 normal; varying vec3 surface; varying float material; void main(){ surface=position; float cx=cos(rotation.x),sx=sin(rotation.x),cy=cos(rotation.y),sy=sin(rotation.y); vec3 p=vec3(position.x,position.y*cx-position.z*sx,position.y*sx+position.z*cx); p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy); normal=normalize(p); material=white; gl_Position=vec4(p.xy*.88,-p.z*.5,1.0); }'));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `
    precision highp float;
    varying vec3 normal;
    varying vec3 surface;
    varying float material;
    void main() {
      vec3 n = normalize(normal);
      vec3 lightDirection = normalize(vec3(-.55, .75, 1.2));
      vec3 halfDirection = normalize(lightDirection + vec3(0., 0., 1.));
      float diffuse = max(0., dot(n, lightDirection));
      float sky = .5 + .5 * n.y;
      float grain = sin(surface.x * 155.) * sin(surface.y * 149.) * sin(surface.z * 157.);
      float broadHighlight = pow(max(0., dot(n, halfDirection)), 22.);
      float fineHighlight = pow(max(0., dot(n, halfDirection)), 75.);
      vec3 leather = mix(vec3(.055, .058, .06), vec3(.92, .91, .875), material);
      leather *= 1. + grain * .018;
      vec3 ambient = mix(vec3(.24, .22, .20), vec3(.39, .42, .46), sky);
      vec3 color = leather * (ambient + vec3(.69, .66, .61) * diffuse);
      color += vec3(1., .97, .90) * (broadHighlight * .09 + fineHighlight * .045);
      gl_FragColor = vec4(color, 1.);
    }
  `));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(program);
  var data=[];
  model.f.forEach(function(f){ for(var j=1;j<f[0].length-1;j++){[f[0][0],f[0][j],f[0][j+1]].forEach(function(i){var p=model.v[i];data.push(p[0],p[1],p[2],f[1]);});} });
  var buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
  var pos=gl.getAttribLocation(program,'position'), white=gl.getAttribLocation(program,'white');
  gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,16,0);
  gl.enableVertexAttribArray(white);gl.vertexAttribPointer(white,1,gl.FLOAT,false,16,12);
  var rotation=gl.getUniformLocation(program,'rotation');
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  var disabled=window.matchMedia('(max-width:760px), (prefers-reduced-motion:reduce)');
  var last=0,spin=0;
  function update(time){
    requestAnimationFrame(update);
    var dt=Math.min((time-last)/1000,.05);last=time;
    if(disabled.matches || document.hidden)return;
    var rect=section.getBoundingClientRect();
    if(rect.bottom<0 || rect.top>innerHeight)return;
    var size=canvas.clientWidth, resolution=Math.ceil(size*Math.min(devicePixelRatio||1,3));
    if(canvas.width!==resolution){canvas.width=canvas.height=resolution;gl.viewport(0,0,resolution,resolution);}
    spin+=dt*.45;
    var y=Math.max(90,Math.min(rect.height-size-70,innerHeight*.52-rect.top-size/2));
    canvas.style.transform='translate3d(0,'+y+'px,0)';
    gl.uniform2f(rotation,-rect.top/(size*.5),spin);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,data.length/4);
  }
  requestAnimationFrame(update);
})();
