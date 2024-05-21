(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function e(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(r){if(r.ep)return;r.ep=!0;const n=e(r);fetch(r.href,n)}})();class st{constructor(t,e){this.initialized=!1,this.type=0,this.vsSource="",this.fsSource="",this.uniformLocations={},this.attributeLocations={},this._shaderCompiled=!1,this.gl=t;const s=t.context;this.ext=s.getExtension("KHR_parallel_shader_compile"),this._program=s.createProgram(),this.vs=s.createShader(s.VERTEX_SHADER),this.fs=s.createShader(s.FRAGMENT_SHADER),this.type=this.detectType(e),this.vsSource=this.getVertexShader(this.type),s.shaderSource(this.vs,this.vsSource),s.compileShader(this.vs),this.fsSource=`${this.getFragmentShader(this.type)}${e}`,s.shaderSource(this.fs,this.fsSource),s.compileShader(this.fs),s.attachShader(this._program,this.vs),s.attachShader(this._program,this.fs),s.linkProgram(this._program)}get program(){if(this.initialized)return this._program;this.initialized=!0;const t=this.gl.context;let e=t.getShaderParameter(this.vs,t.COMPILE_STATUS);if(!e)throw console.table(this.vsSource.split(`
`)),new Error(`ImageEffectRenderer: Vertex shader compilation failed: ${t.getShaderInfoLog(this.vs)}`);if(e=t.getShaderParameter(this.fs,t.COMPILE_STATUS),!e)throw console.table(this.fsSource.split(`
`)),new Error(`ImageEffectRenderer: Shader compilation failed: ${t.getShaderInfoLog(this.fs)}`);if(e=t.getProgramParameter(this._program,t.LINK_STATUS),!e)throw new Error(`ImageEffectRenderer: Program linking failed: ${t.getProgramInfoLog(this._program)}`);return this._program}get shaderCompiled(){return this._shaderCompiled=this._shaderCompiled||!this.ext||this.gl.context.getProgramParameter(this._program,this.ext.COMPLETION_STATUS_KHR),this._shaderCompiled}use(){this.gl.context.useProgram(this.program)}getUniformLocation(t){return this.uniformLocations[t]!==void 0?this.uniformLocations[t]:this.uniformLocations[t]=this.gl.context.getUniformLocation(this._program,t)}getAttributeLocation(t){return this.attributeLocations[t]!==void 0?this.attributeLocations[t]:(this.gl.context.useProgram(this.program),this.attributeLocations[t]=this.gl.context.getAttribLocation(this._program,t))}detectType(t){const e=/mainImage/gmi,s=/^#version[\s]+300[\s]+es[\s]+/gmi;return e.exec(t)?this.gl.isWebGL2?1:0:s.exec(t)?3:2}getFragmentShader(t){switch(t){case 0:return`precision highp float;

                        ${this.getUniformShader()}

                        varying vec2 vUV0;
                        void mainImage(out vec4, vec2);

                        vec4 texture(sampler2D tex, vec2 uv) {
                            return texture2D(tex, uv);
                        }

                        void main(void) {
                              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                              mainImage(gl_FragColor, vUV0 * iResolution.xy);
                        }
                        `;case 1:return`#version 300 es
                        precision highp float;

                        ${this.getUniformShader()}

                        in vec2 vUV0;
                        out vec4 outFragColor;

                        void mainImage(out vec4, vec2);

                        vec4 texture2D(sampler2D tex, vec2 uv) {
                            return texture(tex, uv);
                        }

                        void main(void) {
                            outFragColor = vec4(0.0, 0.0, 0.0, 1.0);
                            mainImage(outFragColor, vUV0 * iResolution.xy);
                        }
                        `;default:return""}}getVertexShader(t){const e=`#version 300 es
                in  vec3 aPos;
                in vec2 aUV;

                uniform float iAspect;

                out vec2 vScreen;
                out vec2 vUV0;

                void main(void) {
                    vUV0 = aUV;
                    vScreen = aPos.xy;
                    vScreen.x *= iAspect;
                    gl_Position = vec4(aPos, 1.0);
                }`,s=`attribute vec3 aPos;
                attribute vec2 aUV;

                uniform float iAspect;

                varying vec2 vScreen;
                varying vec2 vUV0;

                void main(void) {
                    vUV0 = aUV;
                    vScreen = aPos.xy;
                    vScreen.x *= iAspect;
                    gl_Position = vec4(aPos, 1.0);
                }`,r=`attribute vec2 aPos;
                    attribute vec2 aUV;

                    varying vec2 vUV0;

                    void main(void) {
                        vUV0 = aUV;
                        gl_Position = vec4(aPos, 0.0, 1.0);
                    }
                `,n=`#version 300 es
                    in vec2 aPos;
                    in vec2 aUV;

                    out vec2 vUV0;

                    void main(void) {
                        vUV0 = aUV;
                        gl_Position = vec4(aPos, 0.0, 1.0);
                    }
                `;switch(t){case 0:return r;case 1:return n;case 2:return s;case 3:default:return e}}getUniformShader(){return`
            uniform vec2 iResolution;
            uniform float iTime;
            uniform float iGlobalTime;
            uniform float iAspect;
            uniform int iFrame;
            uniform vec4 iMouse;

            uniform highp sampler2D iChannel0;
            uniform highp sampler2D iChannel1;
            uniform highp sampler2D iChannel2;
            uniform highp sampler2D iChannel3;
            uniform highp sampler2D iChannel4;
            uniform highp sampler2D iChannel5;
            uniform highp sampler2D iChannel6;
            uniform highp sampler2D iChannel7;

            uniform vec2 iChannelResolution0;
            uniform vec2 iChannelResolution1;
            uniform vec2 iChannelResolution2;
            uniform vec2 iChannelResolution3;
            uniform vec2 iChannelResolution4;
            uniform vec2 iChannelResolution5;
            uniform vec2 iChannelResolution6;
            uniform vec2 iChannelResolution7;
            `}}var p=(i=>(i[i.INT=0]="INT",i[i.FLOAT=1]="FLOAT",i[i.VEC2=2]="VEC2",i[i.VEC3=3]="VEC3",i[i.VEC4=4]="VEC4",i[i.MATRIX=5]="MATRIX",i))(p||{});class ot{constructor(t,e){this.x=0,this.y=0,this.z=0,this.w=0,this.type=t,this.name=e}}class ${constructor(t=void 0){this.isWebGL2=!0,this.lastQuadVBO=void 0,this.sharedPrograms={},this.sharedTextures={},this.canvas=t||document.createElement("canvas");const e={premultipliedAlpha:!0,alpha:!0,preserveDrawingBuffer:!1,antialias:!1,depth:!1,stencil:!1};this.context=this.canvas.getContext("webgl2",e),this.context||(this.context=this.canvas.getContext("webgl",e),this.isWebGL2=!1),this.context.getExtension("WEBGL_color_buffer_float"),this.context.getExtension("EXT_color_buffer_float"),this.context.getExtension("OES_texture_float"),this.context.getExtension("OES_texture_float_linear"),this.context.getExtension("KHR_parallel_shader_compile"),this.context.clearColor(0,0,0,0),this.context.clear(this.context.COLOR_BUFFER_BIT),this.context.enable(this.context.BLEND),this.context.blendFunc(this.context.ONE,this.context.ONE_MINUS_SRC_ALPHA),this.quadVBO=this.generateQuad()}generateQuad(){const t=this.context,e=new Float32Array([-1,1,0,1,-1,-1,0,0,1,1,1,1,1,-1,1,0]),s=t.createBuffer();return t.bindBuffer(t.ARRAY_BUFFER,s),t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW),s}drawQuad(t,e){const s=this.context;this.lastQuadVBO!==this.quadVBO&&(this.lastQuadVBO=this.quadVBO,s.bindBuffer(s.ARRAY_BUFFER,this.quadVBO),s.enableVertexAttribArray(t),s.vertexAttribPointer(t,2,s.FLOAT,!1,4*4,0),s.enableVertexAttribArray(e),s.vertexAttribPointer(e,2,s.FLOAT,!1,4*4,2*4)),s.drawArrays(s.TRIANGLE_STRIP,0,4)}getCachedTexture(t,e){const s=`${t}_${e.clampX}_${e.clampY}_${e.useMipmap}`;return this.sharedTextures[t]?this.sharedTextures[s]:this.sharedTextures[s]=this.context.createTexture()}compileShader(t){return this.sharedPrograms[t]?this.sharedPrograms[t]:this.sharedPrograms[t]=new st(this,t)}setTextureParameter(t,e){const s=this.context;s.bindTexture(s.TEXTURE_2D,t),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,e.clampX?s.CLAMP_TO_EDGE:s.REPEAT),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,e.clampY?s.CLAMP_TO_EDGE:s.REPEAT),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,e.magFilterLinear?s.LINEAR:s.NEAREST),e.useMipmap?(s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR_MIPMAP_LINEAR),s.generateMipmap(s.TEXTURE_2D)):s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,e.minFilterLinear?s.LINEAR:s.NEAREST)}bindTextures(t){const e=this.context;for(let s=0;s<8;s++){e.activeTexture(e.TEXTURE0+s);const r=t[s];r&&r.buffer?e.bindTexture(e.TEXTURE_2D,r.buffer.src.texture):r&&r.texture?e.bindTexture(e.TEXTURE_2D,r.texture):e.bindTexture(e.TEXTURE_2D,null)}}setUniforms(t,e){const s=this.context;Object.values(t).forEach(r=>{const n=e.getUniformLocation(r.name);if(n!==null)switch(r.type){case p.INT:s.uniform1i(n,r.x);break;case p.FLOAT:s.uniform1f(n,r.x);break;case p.VEC2:s.uniform2f(n,r.x,r.y);break;case p.VEC3:s.uniform3f(n,r.x,r.y,r.z);break;case p.VEC4:s.uniform4f(n,r.x,r.y,r.z,r.w);break;case p.MATRIX:s.uniformMatrix4fv(n,!1,r.matrix);break}})}}const _=class _{constructor(t){this.width=0,this.height=0,this.frame=0,this.uniforms={},this.textures=[],this.gl=t}setImage(t,e,s={}){if(t>=8)throw new Error("ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.");this.setUniformInt(`iChannel${t}`,t),this.setUniformVec2(`iChannelResolution${t}`,e.width,e.height);const r=this.gl.context,n=this.textures[t];if(e instanceof _){n&&n.texture&&!n.cached&&r.deleteTexture(n.texture);const o={...e.options,...s};this.textures[t]={texture:void 0,buffer:e,cached:!1},this.gl.setTextureParameter(e.src.texture,o),this.gl.setTextureParameter(e.dest.texture,o)}else{const o={..._.defaultImageOptions,...s};o.useCache=o.useCache&&e instanceof HTMLImageElement,o.useCache&&n&&n.texture&&!n.cached&&(r.deleteTexture(n.texture),n.texture=void 0);let a=n&&n.texture;o.useCache&&e instanceof HTMLImageElement&&(a=this.gl.getCachedTexture(e.src,o)),a||(a=r.createTexture()),this.textures[t]={texture:a,buffer:void 0,cached:o.useCache},r.bindTexture(r.TEXTURE_2D,a),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,s.flipY?1:0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,e),this.gl.setTextureParameter(a,o)}}setUniformFloat(t,e){this.setUniform(t,p.FLOAT,e,0,0,0,void 0)}setUniformInt(t,e){this.setUniform(t,p.INT,e,0,0,0,void 0)}setUniformVec2(t,e,s){this.setUniform(t,p.VEC2,e,s,0,0,void 0)}setUniformVec3(t,e,s,r){this.setUniform(t,p.VEC3,e,s,r,0,void 0)}setUniformVec4(t,e,s,r,n){this.setUniform(t,p.VEC4,e,s,r,n,void 0)}setUniformMatrix(t,e){this.setUniform(t,p.MATRIX,0,0,0,0,e)}draw(t=0,e,s){this.width=e|0,this.height=s|0,this.program.use(),this.setUniformFloat("iGlobalTime",t),this.setUniformFloat("iTime",t),this.setUniformInt("iFrame",this.frame),this.setUniformFloat("iAspect",e/s),this.setUniformVec2("iResolution",e,s),this.gl.setUniforms(this.uniforms,this.program),this.gl.bindTextures(this.textures),this.gl.drawQuad(this.program.getAttributeLocation("aPos"),this.program.getAttributeLocation("aUV")),this.frame++}get shaderCompiled(){return this.program.shaderCompiled}setUniform(t,e,s,r,n,o,a){let h=this.uniforms[t];h||(h=this.uniforms[t]=new ot(e,t)),h.x=s,h.y=r,h.z=n,h.w=o,h.matrix=a}destruct(){this.textures.forEach(t=>t.texture&&!t.cached&&this.gl.context.deleteTexture(t.texture)),this.textures=[],this.uniforms={}}};_.defaultImageOptions={clampX:!0,clampY:!0,flipY:!1,useMipmap:!0,useCache:!0,minFilterLinear:!0,magFilterLinear:!0};let V=_;class Q{constructor(t,e=WebGLRenderingContext.UNSIGNED_BYTE){if(this.width=0,this.height=0,this.format=WebGLRenderingContext.RGBA,this.internalFormat=WebGLRenderingContext.RGBA,this.type=WebGLRenderingContext.UNSIGNED_BYTE,this.gl=t,this.type=e,t.isWebGL2)switch(e){case WebGLRenderingContext.UNSIGNED_BYTE:this.internalFormat=WebGL2RenderingContext.RGBA8;break;case WebGLRenderingContext.FLOAT:this.internalFormat=WebGL2RenderingContext.RGBA32F;break}else this.internalFormat=this.format;const s=t.context;this.texture=s.createTexture(),this.resize(16,16),this.frameBuffer=s.createFramebuffer(),s.bindFramebuffer(s.FRAMEBUFFER,this.frameBuffer),s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,this.texture,0),s.bindFramebuffer(s.FRAMEBUFFER,null)}resize(t,e){if(this.width===(t|0)&&this.height===(e|0))return;this.width=t|0,this.height=e|0;const s=this.gl.context;s.bindTexture(s.TEXTURE_2D,this.texture),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,0),this.gl.isWebGL2?s.texImage2D(s.TEXTURE_2D,0,this.internalFormat,this.width,this.height,0,this.format,this.type,null):s.texImage2D(s.TEXTURE_2D,0,this.format,this.width,this.height,0,this.format,this.type,null)}destruct(){const t=this.gl.context;this.frameBuffer&&t.deleteFramebuffer(this.frameBuffer),this.texture&&t.deleteTexture(this.texture)}}const k=class k extends V{constructor(t,e={}){super(t),this.options={...k.defaultBufferOptions,...e},this.frameBuffer0=new Q(t,this.options.type),this.frameBuffer1=new Q(t,this.options.type)}draw(t=0,e,s){if(e<=0||s<=0)return;const r=this.gl.context,n=this.dest;n.resize(e,s),r.bindFramebuffer(r.FRAMEBUFFER,n.frameBuffer),r.clear(r.COLOR_BUFFER_BIT),super.draw(t,e,s),r.bindFramebuffer(r.FRAMEBUFFER,null)}get src(){return this.frame%2===0?this.frameBuffer0:this.frameBuffer1}get dest(){return this.frame%2===1?this.frameBuffer0:this.frameBuffer1}destruct(){super.destruct(),this.frameBuffer0.destruct(),this.frameBuffer1.destruct()}};k.defaultBufferOptions={...V.defaultImageOptions,useMipmap:!1,useCache:!1,type:5121};let H=k;const j=class j extends V{constructor(t,e,s,r){if(super(t),this.buffers=[],this.time=0,this.tickFuncs=[],this.readyFuncs=[],this.startTime=-1,this.drawOneFrame=!1,this.animationRequestId=0,this._ready=!1,this.options={...r},this.index=j.index++,this.container=e,this.main=this,this.options.useSharedContext){this.canvas=document.createElement("canvas");const n=this.canvas.getContext("2d");n.fillStyle="#00000000",n.clearRect(0,0,this.canvas.width,this.canvas.height)}else this.canvas=this.gl.canvas;this.canvas.style.inset="0",this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.margin="0",this.canvas.style.display="block",this.container.appendChild(this.canvas),this.program=new st(this.gl,s),this.resizeObserver=new ResizeObserver(()=>{this.options.autoResize&&this.updateSize()}),this.resizeObserver.observe(e),this.options.useSharedContext||this.drawingLoop(0)}play(){this.options.loop=!0}stop(){this.options.loop=!1}createBuffer(t,e,s={}){const r=this.buffers[t];r&&r.destruct();const n=new H(this.gl,s);return n.program=this.gl.compileShader(e),n.main=this,this.buffers[t]=n}tick(t){this.tickFuncs.push(t)}ready(t){this.readyFuncs.push(t)}drawFrame(t=0){this.time=t/1e3,this.drawOneFrame=!0}get drawThisFrame(){return(this.options.loop||this.drawOneFrame)&&this.width>0&&this.height>0&&(!this.options.asyncCompile||this.allShadersCompiled)}drawInstance(t){const e=this.gl.context;this.drawOneFrame||(this.time+=t),this.tickFuncs.forEach(s=>s(t)),this.buffers.forEach(s=>{s&&(e.viewport(0,0,this.width,this.height),s.draw(this.time,this.canvas.width,this.canvas.height))}),e.viewport(0,0,this.width,this.height),e.clear(e.COLOR_BUFFER_BIT),this.draw(this.time,this.canvas.width,this.canvas.height),this.drawOneFrame=!1}get allShadersCompiled(){return this.shaderCompiled&&this.buffers.every(t=>t&&t.shaderCompiled)}update(t){this.allShadersCompiled&&(this._ready||(this._ready=!0,this.readyFuncs.forEach(e=>e()),this.readyFuncs=[]))}updateSize(){this.width=this.container.offsetWidth*this.options.pixelRatio|0,this.height=this.container.offsetHeight*this.options.pixelRatio|0,(this.width!==this.canvas.width||this.height!==this.canvas.height)&&(this.canvas.width=this.width,this.canvas.height=this.height,this.drawOneFrame=!0)}drawingLoop(t=0){this.animationRequestId=window.requestAnimationFrame(s=>this.drawingLoop(s)),t/=1e3;const e=this.startTime<0?1/60:t-this.startTime;this.startTime=t>0?t:-1,this.update(e),this.drawThisFrame&&this.drawInstance(e)}destruct(){cancelAnimationFrame(this.animationRequestId),super.destruct(),this.resizeObserver.disconnect(),this.container.removeChild(this.canvas),this.canvas.replaceWith(this.canvas.cloneNode(!0)),this.buffers.forEach(t=>{t.destruct()}),this.buffers=[],this.tickFuncs=[]}copyCanvas(){const t=this.gl.canvas,e=this.canvas.getContext("2d");e.clearRect(0,0,this.width,this.height),e.drawImage(t,0,t.height-this.height,this.width,this.height,0,0,this.width,this.height)}};j.index=0;let G=j;const u=class u{constructor(){throw new Error("Use ImageEffectRenderer.createTemporary to create an ImageEffectRenderer")}static createTemporary(t,e,s={}){const r={...u.defaultOptions,...s};if(r.useSharedContext){u.sharedInstance||(u.sharedInstance=new $,this.drawInstances(0));const n=new G(u.sharedInstance,t,e,r);return this.poolInUse.push(n),n}else{const n=u.poolWebGLInstance.pop()||new $;return new G(n,t,e,r)}}static releaseTemporary(t){t.options.useSharedContext||this.poolWebGLInstance.push(t.gl),t.stop(),t.destruct();const e=u.poolInUse.indexOf(t);e>-1&&u.poolInUse.splice(e,1)}static drawInstances(t=0){window.requestAnimationFrame(h=>this.drawInstances(h)),t/=1e3;const e=u.sharedTime<0?1/60:t-u.sharedTime;u.sharedTime=t;const s=u.sharedInstance.canvas,r=u.sharedInstance.context,n=u.poolInUse;let o=0,a=0;n.forEach(h=>{h.update(e)}),n.forEach(h=>{h.drawThisFrame&&(o=Math.max(o,h.width),a=Math.max(a,h.height))}),(o>s.width||a>s.height)&&(s.width=o,s.height=a),r.clear(r.COLOR_BUFFER_BIT),n.forEach(h=>{h.drawThisFrame&&(h.drawInstance(e),h.copyCanvas())})}};u.defaultOptions={loop:!1,autoResize:!0,pixelRatio:typeof window<"u"?window.devicePixelRatio:1,useSharedContext:!1,asyncCompile:!0},u.poolInUse=[],u.poolWebGLInstance=[],u.sharedTime=-1;let D=u;class at{constructor(){this.press=!1,this.down=!1,this.downTime=0}}class ht{constructor(t){this.mousePos={x:0,y:0},this.previousMousePos={x:0,y:0},this.mouseVelocity={x:0,y:0},this.normalized={x:0,y:0},this.mouseClickCallbacks=[],this.buttons=[],this.resetSpeed=!1,this.canvas=t;for(let e=0;e<3;e++)this.buttons.push(new at);this.canvas.addEventListener("touchstart",this.onMouseStart.bind(this),!1),this.canvas.addEventListener("touchmove",this.touchMoveListener.bind(this),!1),this.canvas.addEventListener("touchend",this.endListener.bind(this),!1),this.canvas.addEventListener("touchcancel",this.endListener.bind(this),!1),this.canvas.addEventListener("mousedown",this.onMouseStart.bind(this),!1),this.canvas.addEventListener("mousemove",this.mouseMoveListener.bind(this),!1),this.canvas.addEventListener("mouseup",this.endListener.bind(this),!1),this.canvas.addEventListener("mousecancel",this.endListener.bind(this),!1),this.canvas.addEventListener("mouseout",this.endListener.bind(this),!1)}touchMoveListener(t){this.setMouse(t.targetTouches[0])}mouseMoveListener(t){this.setMouse(t)}endListener(){this.buttons[0].press=!1}onMouseStart(t){t.preventDefault();let e=!1;t instanceof TouchEvent?(e=!0,this.setMouse(t.targetTouches[0])):this.setMouse(t),this.resetSpeed=!0,this.buttons[e?0:t.which-1].press=!0,this.mouseClickCallbacks.forEach(s=>{s()})}setMouse(t){this.mousePos.x=t.pageX,this.mousePos.y=t.pageY}get normalizedVelocity(){return{...this.mouseVelocity}}get mouseDown(){return this.buttons[0].press}click(t){this.mouseClickCallbacks.push(t)}update(t){this.normalized.x=this.mousePos.x/this.canvas.clientWidth,this.normalized.y=this.mousePos.y/this.canvas.clientHeight,this.resetSpeed?(this.resetSpeed=!1,this.mouseVelocity.x=0,this.mouseVelocity.y=0):(this.mouseVelocity.x=this.normalized.x-this.previousMousePos.x,this.mouseVelocity.y=this.normalized.y-this.previousMousePos.y),this.previousMousePos.x=this.normalized.x,this.previousMousePos.y=this.normalized.y;for(let e=0;e<3;e++){const s=this.buttons[e];s.down=!1,this.buttons[e].press?(s.downTime===0&&(s.down=!0),s.downTime+=t):s.downTime=0}}destruct(){this.canvas&&(this.canvas.removeEventListener("touchstart",this.onMouseStart,!1),this.canvas.removeEventListener("touchmove",this.touchMoveListener,!1),this.canvas.removeEventListener("touchend",this.endListener,!1),this.canvas.removeEventListener("touchcancel",this.endListener,!1),this.canvas.removeEventListener("mousedown",this.onMouseStart,!1),this.canvas.removeEventListener("mousemove",this.mouseMoveListener,!1),this.canvas.removeEventListener("mouseend",this.endListener,!1),this.canvas.removeEventListener("mousecancel",this.endListener,!1),this.canvas.removeEventListener("mouseout",this.endListener,!1))}}function ct(i,t,e){return Math.max(t,Math.min(e,i))}function it(i){return Math.max(0,Math.min(1,i))}function N(i,t,e){return i+(t-i)*e}function K(i){return i=it(i),i*i*(3-2*i)}const ut=1e-9;function lt(i,t){return{x:i.x-t.x,y:i.y-t.y,z:i.z-t.z}}function Z(i,t){return{x:i.y*t.z-i.z*t.y,y:i.z*t.x-i.x*t.z,z:i.x*t.y-i.y*t.x}}function W(i){const t=Math.sqrt(i.x*i.x+i.y*i.y+i.z*i.z);return{x:i.x/t,y:i.y/t,z:i.z/t}}function J(i,t){const e=t[0]*i.x+t[4]*i.y+t[8]*i.z+t[12]*i.w,s=t[1]*i.x+t[5]*i.y+t[9]*i.z+t[13]*i.w,r=t[2]*i.x+t[6]*i.y+t[10]*i.z+t[14]*i.w,n=t[3]*i.x+t[7]*i.y+t[11]*i.z+t[15]*i.w;return{x:e,y:s,z:r,w:n}}function dt(i,t,e,s){const r=1/Math.tan(i/2);let n;const o=Array(16).fill(0);return o[0]=r/t,o[5]=r,o[11]=-1,s!==1/0?(n=1/(e-s),o[10]=(s+e)*n,o[14]=2*s*e*n):(o[10]=-1,o[14]=-2*e),o}function mt(i,t){const e=Array(16).fill(0);for(let s=0;s<4;s++)for(let r=0;r<4;r++)for(let n=0;n<4;n++)e[s*4+r]+=i[s*4+n]*t[n*4+r];return e}function X(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}function ft(i){const t=Array(16).fill(0),[e,s,r,n,o,a,h,m,l,d,f,x,v,g,y,w]=i,T=e*a-s*o,R=e*h-r*o,C=e*m-n*o,b=s*h-r*a,L=s*m-n*a,I=r*m-n*h,z=l*g-d*v,M=l*y-f*v,U=l*w-x*v,S=d*y-f*g,A=d*w-x*g,P=f*w-x*y;let c=T*P-R*A+C*S+b*U-L*M+I*z;return c&&(c=1/c,t[0]=(a*P-h*A+m*S)*c,t[1]=(r*A-s*P-n*S)*c,t[2]=(g*I-y*L+w*b)*c,t[3]=(f*L-d*I-x*b)*c,t[4]=(h*U-o*P-m*M)*c,t[5]=(e*P-r*U+n*M)*c,t[6]=(y*C-v*I-w*R)*c,t[7]=(l*I-f*C+x*R)*c,t[8]=(o*A-a*U+m*z)*c,t[9]=(s*U-e*A-n*z)*c,t[10]=(v*L-g*C+w*T)*c,t[11]=(d*C-l*L-x*T)*c,t[12]=(a*M-o*S-h*z)*c,t[13]=(e*S-s*M+r*z)*c,t[14]=(g*R-v*b-y*T)*c,t[15]=(l*b-d*R+f*T)*c),t}function xt(i,t,e){const s=W(lt(i,t)),r=W(Z(e,s)),n=W(Z(s,r));return[r.x,n.x,s.x,r.y,n.y,s.y,r.z,n.z,s.z]}function q(i){const t=i[0]+i[4]+i[8];let e,s,r,n;if(t>0){let o=Math.sqrt(t+1);n=.5*o,o=.5/o,e=(i[5]-i[7])*o,s=(i[6]-i[2])*o,r=(i[1]-i[3])*o}else{let o=0;i[4]>i[0]&&(o=1),i[8]>i[o*3+o]&&(o=2);const a=(o+1)%3,h=(o+2)%3,m=Math.sqrt(i[o*3+o]-i[a*3+a]-i[h*3+h]+1),l=.5*m,d=.5/m;n=(i[a*3+h]-i[h*3+a])*d;const f=(i[a*3+o]+i[o*3+a])*d,x=(i[h*3+o]+i[o*3+h])*d;e=o==0?l:a==0?f:x,s=o==1?l:a==1?f:x,r=o==2?l:a==2?f:x}return{x:e,y:s,z:r,w:n}}function tt(i){return[i[0],i[1],i[2],0,i[3],i[4],i[5],0,i[6],i[7],i[8],0,0,0,0,1]}function F(){return{w:1,x:0,y:0,z:0}}function Y(i,t){const e=i.w*t.w-i.x*t.x-i.y*t.y-i.z*t.z,s=i.w*t.x+i.x*t.w+i.y*t.z-i.z*t.y,r=i.w*t.y-i.x*t.z+i.y*t.w+i.z*t.x,n=i.w*t.z+i.x*t.y-i.y*t.x+i.z*t.w;return{w:e,x:s,y:r,z:n}}function pt(i,t){const e=Math.sin(t/2),r={w:Math.cos(t/2),x:e,y:0,z:0};return Y(i,r)}function rt(i,t){const e=Math.sin(t/2),r={w:Math.cos(t/2),x:0,y:e,z:0};return Y(i,r)}function vt(i,t){const e=Math.sin(t/2),r={w:Math.cos(t/2),x:0,y:0,z:e};return Y(i,r)}function et(i){const t=nt(i),e=t[0],s=t[3];t[6];const r=t[1],n=t[4];t[7];const o=t[2],a=t[5],h=t[8];let m=0,l=0,d=0;return m=Math.asin(ct(a,-1,1)),Math.abs(a)<.9999999?(l=Math.atan2(-o,h),d=Math.atan2(-s,n)):(l=0,d=Math.atan2(r,e)),{x:m,y:l,z:d}}function gt(i){let t=F();return t=pt(t,i.x),t=rt(t,i.y),t=vt(t,i.z),t}function yt(i){const t=Math.sqrt(i.w*i.w+i.x*i.x+i.y*i.y+i.z*i.z);return t===0?{w:1,x:0,y:0,z:0}:{w:i.w/t,x:i.x/t,y:i.y/t,z:i.z/t}}function wt(i,t,e){let s=i.x*t.x+i.y*t.y+i.z*t.z+i.w*t.w;s<0&&(s=-s,t.x=-t.x,t.y=-t.y,t.z=-t.z,t.w=-t.w);let r,n;if(1-s>ut){const o=Math.acos(s),a=Math.sin(o);r=Math.sin((1-e)*o)/a,n=Math.sin(e*o)/a}else r=1-e,n=e;return yt({x:r*i.x+n*t.x,y:r*i.y+n*t.y,z:r*i.z+n*t.z,w:r*i.w+n*t.w})}function nt(i){const t=Array(9).fill(0),{x:e,y:s,z:r,w:n}=i,o=e+e,a=s+s,h=r+r,m=e*o,l=s*o,d=s*a,f=r*o,x=r*a,v=r*h,g=n*o,y=n*a,w=n*h;return t[0]=1-d-v,t[3]=l-w,t[6]=f+y,t[1]=l+w,t[4]=1-m-v,t[7]=x-g,t[2]=f-y,t[5]=x+g,t[8]=1-m-d,t}class O{constructor(){this.options={...O.defaultOptions},this.lastUserRotateSpeed={x:0,y:0},this.currentRotateSpeed={x:0,y:0},this.slowDownTimer=0,this.euler={x:0,y:0,z:0}}init(t,e){this.renderer=t,this.options={...O.defaultOptions,...e},this.mouseListener=new ht(this.renderer.canvas)}update(t,e,s){this.mouseListener.update(t);const r=this.renderer.aspectRatio,n=.5/Math.tan(this.renderer.fov*.5),o=Math.atan2(r*.5,n)*2;if(this.mouseListener.mouseDown){const h=this.mouseListener.normalizedVelocity;this.lastUserRotateSpeed.x=N(-h.x*o*(1/t),this.currentRotateSpeed.x,this.options.inertia),this.lastUserRotateSpeed.y=N(h.y*this.renderer.fov*(1/t),this.currentRotateSpeed.y,this.options.inertia),this.slowDownTimer=this.options.slowDownTime}const a=this.options.slowDownTime>0?this.slowDownTimer/this.options.slowDownTime:0;if(this.currentRotateSpeed.x=N(0,this.lastUserRotateSpeed.x,a),this.currentRotateSpeed.y=N(0,this.lastUserRotateSpeed.y,a),this.slowDownTimer=Math.max(0,this.slowDownTimer-t),this.options.userInteractions&&!s){this.euler=et(e);const h=this.euler;return h.x-=this.currentRotateSpeed.y*t,h.y+=this.currentRotateSpeed.x*t,h.z=0,this.options.clampXRotation&&(h.x=Math.min(Math.max(h.x,this.options.clampXRotation[0]),this.options.clampXRotation[1])),this.options.clampYRotation&&(h.y=Math.min(Math.max(h.y,this.options.clampYRotation[0]),this.options.clampYRotation[1])),gt(h)}else return this.euler=et(e),e}destruct(){this.mouseListener.destruct()}}O.defaultOptions={inertia:.5,slowDownTime:.5,clampXRotation:[-.5,.5],clampYRotation:void 0,userInteractions:!0};class E{constructor(t,e,s={}){this.transitionProgress=1,this.transitionDuration=1,this.transitionEase=K,this.rotation=F(),this.rotationStart=F(),this.rotationEnd=F(),this.projection=X(),this.view=X(),this.viewProjection=X(),this.invViewProjection=X(),this.options={...E.defaultOptions,...s},this.options.renderer!==!1?this.renderer=this.options.renderer:this.options.controlledRendererInstance?this.renderer=this.options.controlledRendererInstance.main:this.renderer=D.createTemporary(t,this.shader,{useSharedContext:!1,...s}),this.options.rotationController?this.rotationController=this.options.rotationController:this.rotationController=new O,this.rotationController.init(this,this.options.rotationControllerOptions),e&&this.setImage(0,e,{flipY:!0,clampX:!1,clampY:!0,useMipmap:!0}),this.renderer.tick(r=>this.drawingLoop(r))}get fov(){return this.options.fov}set fov(t){this.options.fov=t}get barrelDistortion(){return this.options.barrelDistortion}set barrelDistortion(t){this.options.barrelDistortion=t}get aspectRatio(){return this.canvas.width/this.canvas.height}tick(t){this.renderer.tick(t)}worldToScreen(t){let e={...t,w:1};e=J(e,this.viewProjection),e.x/=e.w,e.y/=e.w;const s=Math.sqrt(e.x*e.x+e.y*e.y),r=this.barrelDistortion;if(r*s>0){const n=Math.pow(9*r*r*s+Math.sqrt(3)*Math.sqrt(27*r*r*r*r*s*s+4*r*r*r),.3333333333333333);let o=n/(Math.pow(2,1/3)*Math.pow(3,2/3)*r);o-=Math.pow(2/3,1/3)/n;const a=o/s;e.x*=a,e.y*=a}return e.x=e.x*.5+.5,e.y=e.y*-.5+.5,{x:e.x,y:e.y,z:e.z}}lookAt(t,e=0,s=K){const r={...t};this.transitionEase=s;let n=xt({x:0,y:0,z:0},r,{x:0,y:1,z:0});this.view=tt(n),e>0?(this.transitionProgress=0,this.rotationStart={...this.rotation},this.rotationEnd=q(n)):this.rotation=q(n)}get canvas(){return this.renderer.canvas}screenToWorld(t){let e=t.x*2-1,s=1-t.y;s=s*2-1;const r=e*e+s*s,n=1+this.barrelDistortion*r;e*=n,s*=n;const a=J({x:e,y:s,z:1,w:1},this.invViewProjection);return{x:a.x,y:a.y,z:a.z}}play(){this.renderer.play()}stop(){this.renderer.stop()}setImage(t,e,s={}){this.renderer.setImage(t,e,s)}drawingLoop(t){this.update(t),this.draw()}update(t){if(this.rotation=this.rotationController.update(t,this.rotation,this.transitionProgress<1),this.transitionProgress<1){this.transitionProgress+=t/this.transitionDuration;const e=this.transitionEase(it(this.transitionProgress));this.rotation=wt(this.rotationStart,this.rotationEnd,e)}this.updateViewProjection()}draw(){const t=this.options.controlledRendererInstance?this.options.controlledRendererInstance:this.renderer;t.setUniformMatrix("uInvViewProjection",new Float32Array(this.invViewProjection)),t.setUniformFloat("uBarrelDistortion",this.barrelDistortion)}updateViewProjection(){this.projection=dt(this.fov,this.aspectRatio,.01,100),this.view=tt(nt(this.rotation)),this.viewProjection=mt(this.view,this.projection),this.invViewProjection=ft(this.viewProjection)}get shader(){return this.options.shader?this.options.shader:E.defaultShader}destruct(){this.renderer&&D.releaseTemporary(this.renderer)}}E.defaultOptions={loop:!0,fov:1,barrelDistortion:.1,shader:!1,renderer:!1,rotationController:!1,controlledRendererInstance:!1,rotationControllerOptions:{}};E.defaultShader=`
uniform mat4 uInvViewProjection;
uniform float uBarrelDistortion;

vec2 getEqUV(vec3 rd) {
  vec2 uv = vec2(atan(rd.z, rd.x), asin(rd.y));
  uv *= vec2(0.15915494309, 0.31830988618);
  uv.y += 0.5;
  return fract(uv);
}

void mainImage( out vec4 c, vec2 p ) {
  vec2 uv = vUV0 * 2. - 1.;

  float r2 = dot(uv,uv);
  uv.xy *= 1.0 + uBarrelDistortion * r2;

  vec4 rd = vec4(uv, 1., 1.);

  rd = uInvViewProjection * rd;

  rd.xyz = normalize(rd.xyz);

  vec2 uv1 = getEqUV(rd.xyz);
  vec3 col1 = texture(iChannel0, uv1).xyz;
  vec2 uv2 = uv1;
  uv2.x = fract(uv2.x + 0.5) - 0.5;
  vec3 col2 = texture(iChannel0, uv2).xyz;
  c.xyz = mix(col1, col2, step(abs(uv2.x), 0.25));
  c.w = 1.;
}`;class B{static loadImages(t){return Promise.all(t.map(e=>B.loadImage(e)))}static loadImage(t){return new Promise(e=>{const s=new Image;s.onload=()=>e(s),s.src=t})}}class Et{constructor(t){B.loadImages(["panorama_2.jpg"]).then(e=>{this.renderer=new E(t,e[0],{loop:!0})})}}const Tt=`//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float rand(vec2 co)
{
   return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    float time = iTime * 2.0;

    // Create large, incidental noise waves
    float noise = max(0.0, snoise(vec2(time, uv.y * 0.3)) - 0.3) * (1.0 / 0.7);

    // Offset by smaller, constant noise waves
    noise = noise + (snoise(vec2(time*10.0, uv.y * 2.4)) - 0.5) * 0.15;

    // Apply the noise as x displacement for every line
    float xpos = uv.x - noise * noise * 0.25;
	  fragColor = texture(iChannel0, vec2(xpos, uv.y));

    // Mix in some random interference for lines
    fragColor.rgb = mix(fragColor.rgb, vec3(rand(vec2(uv.y * time))), noise * 0.3).rgb;

    // Apply a line pattern every 4 pixels
    if (floor(mod(fragCoord.y * 0.25, 2.0)) == 0.0)
    {
        fragColor.rgb *= 1.0 - (0.15 * noise);
    }

    // Shift green/blue channels (using the red channel)
    fragColor.g = mix(fragColor.r, texture(iChannel0, vec2(xpos + noise * 0.05, uv.y)).g, 0.25);
    fragColor.b = mix(fragColor.r, texture(iChannel0, vec2(xpos - noise * 0.05, uv.y)).b, 0.25);
}
`,Rt=`uniform mat4 uInvViewProjection;
uniform float uBarrelDistortion;
uniform float uMix;

vec2 getEqUV(vec3 rd) {
  vec2 uv = vec2(atan(rd.z, rd.x), asin(rd.y));
  uv *= vec2(0.1591, 0.3183);
  uv.y += 0.5;
  return fract(uv);
}

vec3 getCol(sampler2D tex, vec3 rd) {
  vec2 uv1 = getEqUV(rd.xyz);
  vec3 col1 = texture(tex, uv1).xyz;
  vec2 uv2 = uv1;
  uv2.x = fract(uv2.x + 0.5) - 0.5;
  vec3 col2 = texture(tex, uv2).xyz;
  return mix(col1, col2, step(abs(uv2.x), 0.25));
}

void mainImage(out vec4 c, vec2 p) {
  vec2 uv = vUV0 * 2. - 1.;
  float r2 = dot(uv, uv);
  uv.xy *= 1.0 + uBarrelDistortion * r2;
  vec3 rd = normalize((uInvViewProjection * vec4(uv, 1., 1.)).xyz);
  c.xyz = mix(getCol(iChannel0, rd.xyz), getCol(iChannel1, rd.xyz), smoothstep(.4, .6, uMix));
  c.w = 1.;
}
`;class Ct{constructor(){this.rotation=0}init(t,e){}update(t,e){return this.rotation+=.2*t,rt(F(),this.rotation)}}class bt{constructor(t){this.container=t,this.time=0,B.loadImages(["panorama_1.jpg","panorama_2.jpg"]).then(e=>{this.renderer=D.createTemporary(this.container,Tt,{useSharedContext:!1}),this.renderer.createBuffer(0,Rt),this.renderer.buffers[0].setImage(0,e[0],{clampX:!1,flipY:!0,useMipmap:!0}),this.renderer.buffers[0].setImage(1,e[1],{clampX:!1,flipY:!0,useMipmap:!0}),this.renderer.setImage(0,this.renderer.buffers[0]),this.panorama=new E(this.container,null,{fov:90,rotationController:new Ct,controlledRendererInstance:this.renderer.buffers[0]}),this.panorama.play(),this.panorama.tick(s=>{this.time+=s,this.renderer.buffers[0].setUniformFloat("uMix",Math.abs(this.time/10%1-.5)*2)})})}}class Lt{constructor(t){this.container=t,this.hotspots=[],this.hotspotVisuals=[],B.loadImages(["panorama_1.jpg"]).then(e=>{this.renderer=new E(t,e[0],{rotationControllerOptions:{userInteractions:!1}}),this.renderer.play();const s={x:.5,y:.5,z:1};this.createHotspot(s),this.renderer.lookAt(s),this.renderer.canvas.onmousedown=r=>{const n=this.renderer.canvas.getBoundingClientRect(),o=(r.clientX-n.left)/n.width,a=(r.clientY-n.top)/n.height;if(o>=0&&o<=1&&a>=0&&a<=1){const h=this.renderer.screenToWorld({x:o,y:a});this.createHotspot(h),this.renderer.lookAt(h,2)}},this.renderer.tick(()=>this.tick())})}createHotspot(t){const e=document.createElement("div");e.style.zIndex="1",e.style.width="16px",e.style.height="16px",e.style.marginLeft="-8px",e.style.marginTop="-8px",e.style.borderRadius="8px",e.style.backgroundColor="#FF0000",e.style.position="absolute",this.container.appendChild(e),this.hotspotVisuals.push(e),this.hotspots.push(t)}tick(){for(let t=0;t<this.hotspots.length;t++){const e=this.hotspots[t],s=this.renderer.worldToScreen(e);if(s.z>0&&s.x>0&&s.x<1&&s.y>=0&&s.y<1){const r=s.x*100,n=s.y*100;this.hotspotVisuals[t].style.left=r+"%",this.hotspotVisuals[t].style.top=n+"%",this.hotspotVisuals[t].style.display="block"}else this.hotspotVisuals[t].style.display="none"}}}new Lt(document.getElementsByClassName("grid-item")[0]);new Et(document.getElementsByClassName("grid-item")[1]);new bt(document.getElementsByClassName("grid-item")[2]);
