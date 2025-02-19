var ue=Object.defineProperty;var le=(r,e,t)=>e in r?ue(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var o=(r,e,t)=>le(r,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=t(i);fetch(i.href,n)}})();class oe{constructor(e,t){o(this,"gl");o(this,"_program");o(this,"vs");o(this,"fs");o(this,"initialized",!1);o(this,"ext");o(this,"type",0);o(this,"vsSource","");o(this,"fsSource","");o(this,"uniformLocations",{});o(this,"attributeLocations",{});o(this,"_shaderCompiled",!1);this.gl=e;const s=e.context;this.ext=s.getExtension("KHR_parallel_shader_compile"),this._program=s.createProgram(),this.vs=s.createShader(s.VERTEX_SHADER),this.fs=s.createShader(s.FRAGMENT_SHADER),this.type=this.detectType(t),this.vsSource=this.getVertexShader(this.type),s.shaderSource(this.vs,this.vsSource),s.compileShader(this.vs),this.fsSource=`${this.getFragmentShader(this.type)}${t}`,s.shaderSource(this.fs,this.fsSource),s.compileShader(this.fs),s.attachShader(this._program,this.vs),s.attachShader(this._program,this.fs),s.linkProgram(this._program)}get program(){if(this.initialized)return this._program;this.initialized=!0;const e=this.gl.context;let t=e.getShaderParameter(this.vs,e.COMPILE_STATUS);if(!t)throw console.table(this.vsSource.split(`
`)),new Error(`ImageEffectRenderer: Vertex shader compilation failed: ${e.getShaderInfoLog(this.vs)}`);if(t=e.getShaderParameter(this.fs,e.COMPILE_STATUS),!t)throw console.table(this.fsSource.split(`
`)),new Error(`ImageEffectRenderer: Shader compilation failed: ${e.getShaderInfoLog(this.fs)}`);if(t=e.getProgramParameter(this._program,e.LINK_STATUS),!t)throw new Error(`ImageEffectRenderer: Program linking failed: ${e.getProgramInfoLog(this._program)}`);return this._program}get shaderCompiled(){return this._shaderCompiled=this._shaderCompiled||!this.ext||this.gl.context.getProgramParameter(this._program,this.ext.COMPLETION_STATUS_KHR),this._shaderCompiled}use(){this.gl.context.useProgram(this.program)}getUniformLocation(e){return this.uniformLocations[e]!==void 0?this.uniformLocations[e]:this.uniformLocations[e]=this.gl.context.getUniformLocation(this._program,e)}getAttributeLocation(e){return this.attributeLocations[e]!==void 0?this.attributeLocations[e]:(this.gl.context.useProgram(this.program),this.attributeLocations[e]=this.gl.context.getAttribLocation(this._program,e))}detectType(e){const t=/mainImage/gmi,s=/^#version[\s]+300[\s]+es[\s]+/gmi;return t.exec(e)?this.gl.isWebGL2?1:0:s.exec(e)?3:2}getFragmentShader(e){switch(e){case 0:return`precision highp float;

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
                        `;default:return""}}getVertexShader(e){const t=`#version 300 es
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
                }`,i=`attribute vec2 aPos;
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
                `;switch(e){case 0:return i;case 1:return n;case 2:return s;case 3:default:return t}}getUniformShader(){return`
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
            `}}var v=(r=>(r[r.INT=0]="INT",r[r.FLOAT=1]="FLOAT",r[r.VEC2=2]="VEC2",r[r.VEC3=3]="VEC3",r[r.VEC4=4]="VEC4",r[r.MATRIX=5]="MATRIX",r))(v||{});class de{constructor(e,t){o(this,"type");o(this,"name");o(this,"x",0);o(this,"y",0);o(this,"z",0);o(this,"w",0);o(this,"matrix");this.type=e,this.name=t}}class J{constructor(e=void 0){o(this,"isWebGL2",!0);o(this,"context");o(this,"canvas");o(this,"quadVBO");o(this,"lastQuadVBO");o(this,"sharedPrograms",{});o(this,"sharedTextures",{});this.canvas=e||document.createElement("canvas");const t={premultipliedAlpha:!0,alpha:!0,preserveDrawingBuffer:!1,antialias:!1,depth:!1,stencil:!1};this.context=this.canvas.getContext("webgl2",t),this.context||(this.context=this.canvas.getContext("webgl",t),this.isWebGL2=!1),this.context.getExtension("WEBGL_color_buffer_float"),this.context.getExtension("EXT_color_buffer_float"),this.context.getExtension("OES_texture_float"),this.context.getExtension("OES_texture_float_linear"),this.context.getExtension("KHR_parallel_shader_compile"),this.context.clearColor(0,0,0,0),this.context.clear(this.context.COLOR_BUFFER_BIT),this.context.enable(this.context.BLEND),this.context.blendFunc(this.context.ONE,this.context.ONE_MINUS_SRC_ALPHA),this.quadVBO=this.generateQuad()}generateQuad(){const e=this.context,t=new Float32Array([-1,1,0,1,-1,-1,0,0,1,1,1,1,1,-1,1,0]),s=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),s}drawQuad(e,t){const s=this.context;this.lastQuadVBO!==this.quadVBO&&(this.lastQuadVBO=this.quadVBO,s.bindBuffer(s.ARRAY_BUFFER,this.quadVBO),s.enableVertexAttribArray(e),s.vertexAttribPointer(e,2,s.FLOAT,!1,4*4,0),s.enableVertexAttribArray(t),s.vertexAttribPointer(t,2,s.FLOAT,!1,4*4,2*4)),s.drawArrays(s.TRIANGLE_STRIP,0,4)}getCachedTexture(e,t){const s=`${e}_${t.clampX}_${t.clampY}_${t.useMipmap}`;return this.sharedTextures[e]?this.sharedTextures[s]:this.sharedTextures[s]=this.context.createTexture()}compileShader(e){return this.sharedPrograms[e]?this.sharedPrograms[e]:this.sharedPrograms[e]=new oe(this,e)}setTextureParameter(e,t){const s=this.context;s.bindTexture(s.TEXTURE_2D,e),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,t.clampX?s.CLAMP_TO_EDGE:s.REPEAT),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,t.clampY?s.CLAMP_TO_EDGE:s.REPEAT),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,t.magFilterLinear?s.LINEAR:s.NEAREST),t.useMipmap?(s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR_MIPMAP_LINEAR),s.generateMipmap(s.TEXTURE_2D)):s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,t.minFilterLinear?s.LINEAR:s.NEAREST)}bindTextures(e){const t=this.context;for(let s=0;s<8;s++){t.activeTexture(t.TEXTURE0+s);const i=e[s];i&&i.buffer?t.bindTexture(t.TEXTURE_2D,i.buffer.src.texture):i&&i.texture?t.bindTexture(t.TEXTURE_2D,i.texture):t.bindTexture(t.TEXTURE_2D,null)}}setUniforms(e,t){const s=this.context;Object.values(e).forEach(i=>{const n=t.getUniformLocation(i.name);if(n!==null)switch(i.type){case v.INT:s.uniform1i(n,i.x);break;case v.FLOAT:s.uniform1f(n,i.x);break;case v.VEC2:s.uniform2f(n,i.x,i.y);break;case v.VEC3:s.uniform3f(n,i.x,i.y,i.z);break;case v.VEC4:s.uniform4f(n,i.x,i.y,i.z,i.w);break;case v.MATRIX:s.uniformMatrix4fv(n,!1,i.matrix);break}})}}const _=class _{constructor(e){o(this,"width",0);o(this,"height",0);o(this,"program");o(this,"main");o(this,"gl");o(this,"frame",0);o(this,"uniforms",{});o(this,"textures",[]);this.gl=e}setImage(e,t,s={}){if(e>=8)throw new Error("ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.");this.setUniformInt(`iChannel${e}`,e),this.setUniformVec2(`iChannelResolution${e}`,t.width,t.height);const i=this.gl.context,n=this.textures[e];if(t instanceof _){n&&n.texture&&!n.cached&&i.deleteTexture(n.texture);const a={...t.options,...s};this.textures[e]={texture:void 0,buffer:t,cached:!1},this.gl.setTextureParameter(t.src.texture,a),this.gl.setTextureParameter(t.dest.texture,a)}else{const a={..._.defaultImageOptions,...s};a.useCache=a.useCache&&t instanceof HTMLImageElement,a.useCache&&n&&n.texture&&!n.cached&&(i.deleteTexture(n.texture),n.texture=void 0);let c=n&&n.texture;a.useCache&&t instanceof HTMLImageElement&&(c=this.gl.getCachedTexture(t.src,a)),c||(c=i.createTexture()),this.textures[e]={texture:c,buffer:void 0,cached:a.useCache},i.bindTexture(i.TEXTURE_2D,c),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,s.flipY?1:0),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,t),this.gl.setTextureParameter(c,a)}}setUniformFloat(e,t){this.setUniform(e,v.FLOAT,t,0,0,0,void 0)}setUniformInt(e,t){this.setUniform(e,v.INT,t,0,0,0,void 0)}setUniformVec2(e,t,s){this.setUniform(e,v.VEC2,t,s,0,0,void 0)}setUniformVec3(e,t,s,i){this.setUniform(e,v.VEC3,t,s,i,0,void 0)}setUniformVec4(e,t,s,i,n){this.setUniform(e,v.VEC4,t,s,i,n,void 0)}setUniformMatrix(e,t){this.setUniform(e,v.MATRIX,0,0,0,0,t)}draw(e=0,t,s){this.width=t|0,this.height=s|0,this.program.use(),this.setUniformFloat("iGlobalTime",e),this.setUniformFloat("iTime",e),this.setUniformInt("iFrame",this.frame),this.setUniformFloat("iAspect",t/s),this.setUniformVec2("iResolution",t,s),this.gl.setUniforms(this.uniforms,this.program),this.gl.bindTextures(this.textures),this.gl.drawQuad(this.program.getAttributeLocation("aPos"),this.program.getAttributeLocation("aUV")),this.frame++}get shaderCompiled(){return this.program.shaderCompiled}setUniform(e,t,s,i,n,a,c){let h=this.uniforms[e];h||(h=this.uniforms[e]=new de(t,e)),h.x=s,h.y=i,h.z=n,h.w=a,h.matrix=c}destruct(){this.textures.forEach(e=>e.texture&&!e.cached&&this.gl.context.deleteTexture(e.texture)),this.textures=[],this.uniforms={}}};o(_,"defaultImageOptions",{clampX:!0,clampY:!0,flipY:!1,useMipmap:!0,useCache:!0,minFilterLinear:!0,magFilterLinear:!0});let O=_;class Z{constructor(e,t=WebGLRenderingContext.UNSIGNED_BYTE){o(this,"width",0);o(this,"height",0);o(this,"texture");o(this,"frameBuffer");o(this,"gl");o(this,"format",WebGLRenderingContext.RGBA);o(this,"internalFormat",WebGLRenderingContext.RGBA);o(this,"type",WebGLRenderingContext.UNSIGNED_BYTE);if(this.gl=e,this.type=t,e.isWebGL2)switch(t){case WebGLRenderingContext.UNSIGNED_BYTE:this.internalFormat=WebGL2RenderingContext.RGBA8;break;case WebGLRenderingContext.FLOAT:this.internalFormat=WebGL2RenderingContext.RGBA32F;break}else this.internalFormat=this.format;const s=e.context;this.texture=s.createTexture(),this.resize(16,16),this.frameBuffer=s.createFramebuffer(),s.bindFramebuffer(s.FRAMEBUFFER,this.frameBuffer),s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,this.texture,0),s.bindFramebuffer(s.FRAMEBUFFER,null)}resize(e,t){if(this.width===(e|0)&&this.height===(t|0))return;this.width=e|0,this.height=t|0;const s=this.gl.context;s.bindTexture(s.TEXTURE_2D,this.texture),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,0),this.gl.isWebGL2?s.texImage2D(s.TEXTURE_2D,0,this.internalFormat,this.width,this.height,0,this.format,this.type,null):s.texImage2D(s.TEXTURE_2D,0,this.format,this.width,this.height,0,this.format,this.type,null)}destruct(){const e=this.gl.context;this.frameBuffer&&e.deleteFramebuffer(this.frameBuffer),this.texture&&e.deleteTexture(this.texture)}}const q=class q extends O{constructor(t,s={}){super(t);o(this,"options");o(this,"frameBuffer0");o(this,"frameBuffer1");this.options={...q.defaultBufferOptions,...s},this.frameBuffer0=new Z(t,this.options.type),this.frameBuffer1=new Z(t,this.options.type)}draw(t=0,s,i){if(s<=0||i<=0)return;const n=this.gl.context,a=this.dest;a.resize(s,i),n.bindFramebuffer(n.FRAMEBUFFER,a.frameBuffer),n.clear(n.COLOR_BUFFER_BIT),super.draw(t,s,i),n.bindFramebuffer(n.FRAMEBUFFER,null)}get src(){return this.frame%2===0?this.frameBuffer0:this.frameBuffer1}get dest(){return this.frame%2===1?this.frameBuffer0:this.frameBuffer1}destruct(){super.destruct(),this.frameBuffer0.destruct(),this.frameBuffer1.destruct()}};o(q,"defaultBufferOptions",{...O.defaultImageOptions,useMipmap:!1,useCache:!1,type:5121});let $=q;const j=class j extends O{constructor(t,s,i,n){super(t);o(this,"canvas");o(this,"buffers",[]);o(this,"options");o(this,"time",0);o(this,"index");o(this,"tickFuncs",[]);o(this,"readyFuncs",[]);o(this,"startTime",-1);o(this,"drawOneFrame",!1);o(this,"container");o(this,"animationRequestId",0);o(this,"resizeObserver");o(this,"_ready",!1);if(this.options={...n},this.index=j.index++,this.container=s,this.main=this,this.options.useSharedContext){this.canvas=document.createElement("canvas");const a=this.canvas.getContext("2d");a.fillStyle="#00000000",a.clearRect(0,0,this.canvas.width,this.canvas.height)}else this.canvas=this.gl.canvas;this.canvas.style.inset="0",this.canvas.style.width="100%",this.canvas.style.height="100%",this.canvas.style.margin="0",this.canvas.style.display="block",this.container.appendChild(this.canvas),this.program=new oe(this.gl,i),this.resizeObserver=new ResizeObserver(()=>{this.options.autoResize&&this.updateSize()}),this.resizeObserver.observe(s),this.options.useSharedContext||this.drawingLoop(0)}play(){this.options.loop=!0}stop(){this.options.loop=!1}createBuffer(t,s,i={}){const n=this.buffers[t];n&&n.destruct();const a=new $(this.gl,i);return a.program=this.gl.compileShader(s),a.main=this,this.buffers[t]=a}tick(t){this.tickFuncs.push(t)}ready(t){this.readyFuncs.push(t)}drawFrame(t=0){this.time=t/1e3,this.drawOneFrame=!0}get drawThisFrame(){return(this.options.loop||this.drawOneFrame)&&this.width>0&&this.height>0&&(!this.options.asyncCompile||this.allShadersCompiled)}drawInstance(t){const s=this.gl.context;this.drawOneFrame||(this.time+=t),this.tickFuncs.forEach(i=>i(t)),this.buffers.forEach(i=>{i&&(s.viewport(0,0,this.width,this.height),i.draw(this.time,this.canvas.width,this.canvas.height))}),s.viewport(0,0,this.width,this.height),s.clear(s.COLOR_BUFFER_BIT),this.draw(this.time,this.canvas.width,this.canvas.height),this.drawOneFrame=!1}get allShadersCompiled(){return this.shaderCompiled&&this.buffers.every(t=>t&&t.shaderCompiled)}update(t){this.allShadersCompiled&&(this._ready||(this._ready=!0,this.readyFuncs.forEach(s=>s()),this.readyFuncs=[]))}updateSize(){this.width=this.container.offsetWidth*this.options.pixelRatio|0,this.height=this.container.offsetHeight*this.options.pixelRatio|0,(this.width!==this.canvas.width||this.height!==this.canvas.height)&&(this.canvas.width=this.width,this.canvas.height=this.height,this.drawOneFrame=!0)}drawingLoop(t=0){this.animationRequestId=window.requestAnimationFrame(i=>this.drawingLoop(i)),t/=1e3;const s=this.startTime<0?1/60:t-this.startTime;this.startTime=t>0?t:-1,this.update(s),this.drawThisFrame&&this.drawInstance(s)}destruct(){cancelAnimationFrame(this.animationRequestId),super.destruct(),this.resizeObserver.disconnect(),this.container.removeChild(this.canvas),this.canvas.replaceWith(this.canvas.cloneNode(!0)),this.buffers.forEach(t=>{t.destruct()}),this.buffers=[],this.tickFuncs=[]}copyCanvas(){const t=this.gl.canvas,s=this.canvas.getContext("2d");s.clearRect(0,0,this.width,this.height),s.drawImage(t,0,t.height-this.height,this.width,this.height,0,0,this.width,this.height)}};o(j,"index",0);let W=j;const u=class u{constructor(){throw new Error("Use ImageEffectRenderer.createTemporary to create an ImageEffectRenderer")}static createTemporary(e,t,s={}){const i={...u.defaultOptions,...s};if(i.useSharedContext){u.sharedInstance||(u.sharedInstance=new J,this.drawInstances(0));const n=new W(u.sharedInstance,e,t,i);return this.poolInUse.push(n),n}else{const n=u.poolWebGLInstance.pop()||new J;return new W(n,e,t,i)}}static releaseTemporary(e){e.options.useSharedContext||this.poolWebGLInstance.push(e.gl),e.stop(),e.destruct();const t=u.poolInUse.indexOf(e);t>-1&&u.poolInUse.splice(t,1)}static drawInstances(e=0){window.requestAnimationFrame(h=>this.drawInstances(h)),e/=1e3;const t=u.sharedTime<0?1/60:e-u.sharedTime;u.sharedTime=e;const s=u.sharedInstance.canvas,i=u.sharedInstance.context,n=u.poolInUse;let a=0,c=0;n.forEach(h=>{h.update(t)}),n.forEach(h=>{h.drawThisFrame&&(a=Math.max(a,h.width),c=Math.max(c,h.height))}),(a>s.width||c>s.height)&&(s.width=a,s.height=c),i.clear(i.COLOR_BUFFER_BIT),n.forEach(h=>{h.drawThisFrame&&(h.drawInstance(t),h.copyCanvas())})}};o(u,"defaultOptions",{loop:!1,autoResize:!0,pixelRatio:typeof window<"u"?window.devicePixelRatio:1,useSharedContext:!1,asyncCompile:!0}),o(u,"poolInUse",[]),o(u,"poolWebGLInstance",[]),o(u,"sharedInstance"),o(u,"sharedTime",-1);let B=u;class Y{constructor(){o(this,"press",!1);o(this,"down",!1);o(this,"downTime",0)}}class me{constructor(e){o(this,"canvas");o(this,"mousePos",{x:0,y:0});o(this,"previousMousePos",{x:0,y:0});o(this,"mouseVelocity",{x:0,y:0});o(this,"normalized",{x:0,y:0});o(this,"mouseClickCallbacks",[]);o(this,"buttons",[new Y,new Y,new Y]);o(this,"resetSpeed",!1);this.canvas=e,this.canvas.addEventListener("touchstart",this.onMouseStart.bind(this),!1),this.canvas.addEventListener("touchmove",this.touchMoveListener.bind(this),!1),this.canvas.addEventListener("touchend",this.endListener.bind(this),!1),this.canvas.addEventListener("touchcancel",this.endListener.bind(this),!1),this.canvas.addEventListener("mousedown",this.onMouseStart.bind(this),!1),this.canvas.addEventListener("mousemove",this.mouseMoveListener.bind(this),!1),this.canvas.addEventListener("mouseup",this.endListener.bind(this),!1),this.canvas.addEventListener("mousecancel",this.endListener.bind(this),!1),this.canvas.addEventListener("mouseout",this.endListener.bind(this),!1)}get normalizedVelocity(){return{...this.mouseVelocity}}get mouseDown(){return this.buttons[0].press}click(e){this.mouseClickCallbacks.push(e)}update(e){this.normalized.x=this.mousePos.x/this.canvas.clientWidth,this.normalized.y=this.mousePos.y/this.canvas.clientHeight,this.resetSpeed?(this.resetSpeed=!1,this.mouseVelocity.x=0,this.mouseVelocity.y=0):(this.mouseVelocity.x=this.normalized.x-this.previousMousePos.x,this.mouseVelocity.y=this.normalized.y-this.previousMousePos.y),this.previousMousePos.x=this.normalized.x,this.previousMousePos.y=this.normalized.y,this.buttons.forEach(t=>{t.down=!1,t.press?(t.downTime===0&&(t.down=!0),t.downTime+=e):t.downTime=0})}destruct(){this.canvas&&(this.canvas.removeEventListener("touchstart",this.onMouseStart,!1),this.canvas.removeEventListener("touchmove",this.touchMoveListener,!1),this.canvas.removeEventListener("touchend",this.endListener,!1),this.canvas.removeEventListener("touchcancel",this.endListener,!1),this.canvas.removeEventListener("mousedown",this.onMouseStart,!1),this.canvas.removeEventListener("mousemove",this.mouseMoveListener,!1),this.canvas.removeEventListener("mouseend",this.endListener,!1),this.canvas.removeEventListener("mousecancel",this.endListener,!1),this.canvas.removeEventListener("mouseout",this.endListener,!1))}touchMoveListener(e){this.setMouse(e.targetTouches[0])}mouseMoveListener(e){this.setMouse(e)}endListener(){this.buttons[0].press=!1}onMouseStart(e){e.preventDefault();let t=!1;e instanceof TouchEvent?(t=!0,this.setMouse(e.targetTouches[0])):this.setMouse(e),this.resetSpeed=!0,this.buttons[t?0:e.which-1].press=!0,this.mouseClickCallbacks.forEach(s=>{s()})}setMouse(e){this.mousePos.x=e.pageX,this.mousePos.y=e.pageY}}function fe(r,e,t){return Math.max(e,Math.min(t,r))}function ae(r){return Math.max(0,Math.min(1,r))}function G(r,e,t){return r+(e-r)*t}function ee(r){return r=ae(r),r*r*(3-2*r)}const xe=1e-9;function pe(r,e){return{x:r.x-e.x,y:r.y-e.y,z:r.z-e.z}}function te(r,e){return{x:r.y*e.z-r.z*e.y,y:r.z*e.x-r.x*e.z,z:r.x*e.y-r.y*e.x}}function H(r){const e=Math.sqrt(r.x*r.x+r.y*r.y+r.z*r.z);return{x:r.x/e,y:r.y/e,z:r.z/e}}function se(r,e){const t=e[0]*r.x+e[4]*r.y+e[8]*r.z+e[12]*r.w,s=e[1]*r.x+e[5]*r.y+e[9]*r.z+e[13]*r.w,i=e[2]*r.x+e[6]*r.y+e[10]*r.z+e[14]*r.w,n=e[3]*r.x+e[7]*r.y+e[11]*r.z+e[15]*r.w;return{x:t,y:s,z:i,w:n}}function ve(r,e,t,s){const i=1/Math.tan(r/2);let n;const a=Array(16).fill(0);return a[0]=i/e,a[5]=i,a[11]=-1,n=1/(t-s),a[10]=(s+t)*n,a[14]=2*s*t*n,a}function ge(r,e){const t=Array(16).fill(0);for(let s=0;s<4;s++)for(let i=0;i<4;i++)for(let n=0;n<4;n++)t[s*4+i]+=r[s*4+n]*e[n*4+i];return t}function k(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}function ye(r){const e=Array(16).fill(0),[t,s,i,n,a,c,h,f,d,m,x,p,g,y,w,E]=r,C=t*c-s*a,R=t*h-i*a,b=t*f-n*a,L=s*h-i*c,I=s*f-n*c,z=i*f-n*h,U=d*y-m*g,M=d*w-x*g,S=d*E-p*g,P=m*w-x*y,A=m*E-p*y,F=x*E-p*w;let l=C*F-R*A+b*P+L*S-I*M+z*U;return l&&(l=1/l,e[0]=(c*F-h*A+f*P)*l,e[1]=(i*A-s*F-n*P)*l,e[2]=(y*z-w*I+E*L)*l,e[3]=(x*I-m*z-p*L)*l,e[4]=(h*S-a*F-f*M)*l,e[5]=(t*F-i*S+n*M)*l,e[6]=(w*b-g*z-E*R)*l,e[7]=(d*z-x*b+p*R)*l,e[8]=(a*A-c*S+f*U)*l,e[9]=(s*S-t*A-n*U)*l,e[10]=(g*I-y*b+E*C)*l,e[11]=(m*b-d*I-p*C)*l,e[12]=(c*M-a*P-h*U)*l,e[13]=(t*P-s*M+i*U)*l,e[14]=(y*R-g*L-w*C)*l,e[15]=(d*L-m*R+x*C)*l),e}function we(r,e,t){const s=H(pe(r,e)),i=H(te(t,s)),n=H(te(s,i));return[i.x,n.x,s.x,i.y,n.y,s.y,i.z,n.z,s.z]}function re(r){const e=r[0]+r[4]+r[8];let t,s,i,n;if(e>0){let a=Math.sqrt(e+1);n=.5*a,a=.5/a,t=(r[5]-r[7])*a,s=(r[6]-r[2])*a,i=(r[1]-r[3])*a}else{let a=0;r[4]>r[0]&&(a=1),r[8]>r[a*3+a]&&(a=2);const c=(a+1)%3,h=(a+2)%3,f=Math.sqrt(r[a*3+a]-r[c*3+c]-r[h*3+h]+1),d=.5*f,m=.5/f;n=(r[c*3+h]-r[h*3+c])*m;const x=(r[c*3+a]+r[a*3+c])*m,p=(r[h*3+a]+r[a*3+h])*m;t=a==0?d:c==0?x:p,s=a==1?d:c==1?x:p,i=a==2?d:c==2?x:p}return{x:t,y:s,z:i,w:n}}function ie(r){return[r[0],r[1],r[2],0,r[3],r[4],r[5],0,r[6],r[7],r[8],0,0,0,0,1]}function V(){return{w:1,x:0,y:0,z:0}}function Q(r,e){const t=r.w*e.w-r.x*e.x-r.y*e.y-r.z*e.z,s=r.w*e.x+r.x*e.w+r.y*e.z-r.z*e.y,i=r.w*e.y-r.x*e.z+r.y*e.w+r.z*e.x,n=r.w*e.z+r.x*e.y-r.y*e.x+r.z*e.w;return{w:t,x:s,y:i,z:n}}function Ee(r,e){const t=Math.sin(e/2),s={w:Math.cos(e/2),x:t,y:0,z:0};return Q(r,s)}function he(r,e){const t=Math.sin(e/2),s={w:Math.cos(e/2),x:0,y:t,z:0};return Q(r,s)}function Te(r,e){const t=Math.sin(e/2),s={w:Math.cos(e/2),x:0,y:0,z:t};return Q(r,s)}function ne(r){const e=ce(r),t=e[0],s=e[3];e[6];const i=e[1],n=e[4];e[7];const a=e[2],c=e[5],h=e[8];let f=0,d=0,m=0;return f=Math.asin(fe(c,-1,1)),Math.abs(c)<.9999999?(d=Math.atan2(-a,h),m=Math.atan2(-s,n)):(d=0,m=Math.atan2(i,t)),{x:f,y:d,z:m}}function Ce(r){let e=V();return e=Ee(e,r.x),e=he(e,r.y),e=Te(e,r.z),e}function Re(r){const e=Math.sqrt(r.w*r.w+r.x*r.x+r.y*r.y+r.z*r.z);return e===0?{w:1,x:0,y:0,z:0}:{w:r.w/e,x:r.x/e,y:r.y/e,z:r.z/e}}function be(r,e,t){let s=r.x*e.x+r.y*e.y+r.z*e.z+r.w*e.w;s<0&&(s=-s,e.x=-e.x,e.y=-e.y,e.z=-e.z,e.w=-e.w);let i,n;if(1-s>xe){const a=Math.acos(s),c=Math.sin(a);i=Math.sin((1-t)*a)/c,n=Math.sin(t*a)/c}else i=1-t,n=t;return Re({x:i*r.x+n*e.x,y:i*r.y+n*e.y,z:i*r.z+n*e.z,w:i*r.w+n*e.w})}function ce(r){const e=Array(9).fill(0),{x:t,y:s,z:i,w:n}=r,a=t+t,c=s+s,h=i+i,f=t*a,d=s*a,m=s*c,x=i*a,p=i*c,g=i*h,y=n*a,w=n*c,E=n*h;return e[0]=1-m-g,e[3]=d-E,e[6]=x+w,e[1]=d+E,e[4]=1-f-g,e[7]=p-y,e[2]=x-w,e[5]=p+y,e[8]=1-f-m,e}const D=class D{constructor(){o(this,"options",{...D.defaultOptions});o(this,"renderer");o(this,"mouseListener");o(this,"lastUserRotateSpeed",{x:0,y:0});o(this,"currentRotateSpeed",{x:0,y:0});o(this,"slowDownTimer",0);o(this,"euler",{x:0,y:0,z:0})}init(e,t){this.renderer=e,this.options={...D.defaultOptions,...t},this.mouseListener=new me(this.renderer.canvas)}update(e,t,s){this.mouseListener.update(e);const i=this.renderer.aspectRatio,n=.5/Math.tan(this.renderer.fov*.5),a=Math.atan2(i*.5,n)*2;if(this.mouseListener.mouseDown){const h=this.mouseListener.normalizedVelocity;this.lastUserRotateSpeed.x=G(-h.x*a*(1/e),this.currentRotateSpeed.x,this.options.inertia),this.lastUserRotateSpeed.y=G(h.y*this.renderer.fov*(1/e),this.currentRotateSpeed.y,this.options.inertia),this.slowDownTimer=this.options.slowDownTime}const c=this.options.slowDownTime>0?this.slowDownTimer/this.options.slowDownTime:0;if(this.currentRotateSpeed.x=G(0,this.lastUserRotateSpeed.x,c),this.currentRotateSpeed.y=G(0,this.lastUserRotateSpeed.y,c),this.slowDownTimer=Math.max(0,this.slowDownTimer-e),this.options.userInteractions&&!s){this.euler=ne(t);const h=this.euler;return h.x-=this.currentRotateSpeed.y*e,h.y+=this.currentRotateSpeed.x*e,h.z=0,this.options.clampXRotation&&(h.x=Math.min(Math.max(h.x,this.options.clampXRotation[0]),this.options.clampXRotation[1])),this.options.clampYRotation&&(h.y=Math.min(Math.max(h.y,this.options.clampYRotation[0]),this.options.clampYRotation[1])),Ce(h)}else return this.euler=ne(t),t}destruct(){this.mouseListener.destruct()}};o(D,"defaultOptions",{inertia:.5,slowDownTime:.5,clampXRotation:[-.5,.5],clampYRotation:void 0,userInteractions:!0});let K=D;const T=class T{constructor(e,t,s={}){o(this,"options");o(this,"renderer");o(this,"transitionProgress",1);o(this,"transitionDuration",1);o(this,"transitionEase",ee);o(this,"rotationController");o(this,"rotation",V());o(this,"rotationStart",V());o(this,"rotationEnd",V());o(this,"projection",k());o(this,"view",k());o(this,"viewProjection",k());o(this,"invViewProjection",k());this.options={...T.defaultOptions,...s},this.options.renderer!==!1?this.renderer=this.options.renderer:this.options.controlledRendererInstance?this.renderer=this.options.controlledRendererInstance.main:this.renderer=B.createTemporary(e,this.shader,{useSharedContext:!1,...s}),this.options.rotationController?this.rotationController=this.options.rotationController:this.rotationController=new K,this.rotationController.init(this,this.options.rotationControllerOptions),t&&this.setImage(0,t,{flipY:!0,clampX:!1,clampY:!0,useMipmap:!0}),this.renderer.tick(i=>this.drawingLoop(i))}get fov(){return this.options.fov}set fov(e){this.options.fov=e}get barrelDistortion(){return this.options.barrelDistortion}set barrelDistortion(e){this.options.barrelDistortion=e}get aspectRatio(){return this.canvas.width/this.canvas.height}tick(e){this.renderer.tick(e)}worldToScreen(e){let t={...e,w:1};t=se(t,this.viewProjection),t.x/=t.w,t.y/=t.w;const s=Math.sqrt(t.x*t.x+t.y*t.y),i=this.barrelDistortion;if(i*s>0){const n=Math.pow(9*i*i*s+Math.sqrt(3)*Math.sqrt(27*i*i*i*i*s*s+4*i*i*i),.3333333333333333);let a=n/(Math.pow(2,1/3)*Math.pow(3,2/3)*i);a-=Math.pow(2/3,1/3)/n;const c=a/s;t.x*=c,t.y*=c}return t.x=t.x*.5+.5,t.y=t.y*-.5+.5,{x:t.x,y:t.y,z:t.z}}lookAt(e,t=0,s=ee){const i={...e};this.transitionEase=s;let n=we({x:0,y:0,z:0},i,{x:0,y:1,z:0});this.view=ie(n),t>0?(this.transitionProgress=0,this.rotationStart={...this.rotation},this.rotationEnd=re(n)):this.rotation=re(n)}get canvas(){return this.renderer.canvas}screenToWorld(e){let t=e.x*2-1,s=1-e.y;s=s*2-1;const i=t*t+s*s,n=1+this.barrelDistortion*i;t*=n,s*=n;const a=se({x:t,y:s,z:1,w:1},this.invViewProjection);return{x:a.x,y:a.y,z:a.z}}play(){this.renderer.play()}stop(){this.renderer.stop()}setImage(e,t,s={}){this.renderer.setImage(e,t,s)}drawingLoop(e){this.update(e),this.draw()}update(e){if(this.rotation=this.rotationController.update(e,this.rotation,this.transitionProgress<1),this.transitionProgress<1){this.transitionProgress+=e/this.transitionDuration;const t=this.transitionEase(ae(this.transitionProgress));this.rotation=be(this.rotationStart,this.rotationEnd,t)}this.updateViewProjection()}draw(){const e=this.options.controlledRendererInstance?this.options.controlledRendererInstance:this.renderer;e.setUniformMatrix("uInvViewProjection",new Float32Array(this.invViewProjection)),e.setUniformFloat("uBarrelDistortion",this.barrelDistortion)}updateViewProjection(){this.projection=ve(this.fov,this.aspectRatio,.01,100),this.view=ie(ce(this.rotation)),this.viewProjection=ge(this.view,this.projection),this.invViewProjection=ye(this.viewProjection)}get shader(){return this.options.shader?this.options.shader:T.defaultShader}destruct(){this.renderer&&B.releaseTemporary(this.renderer)}};o(T,"defaultOptions",{loop:!0,fov:1,barrelDistortion:.1,shader:!1,renderer:!1,rotationController:!1,controlledRendererInstance:!1,rotationControllerOptions:{}}),o(T,"defaultShader",`
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
}`);let X=T;class N{static loadImages(e){return Promise.all(e.map(t=>N.loadImage(t)))}static loadImage(e){return new Promise(t=>{const s=new Image;s.onload=()=>t(s),s.src=e})}}class Le{constructor(e){N.loadImages(["panorama_2.jpg"]).then(t=>{this.renderer=new X(e,t[0],{loop:!0})})}}const Ie=`//
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
`,ze=`uniform mat4 uInvViewProjection;
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
`;class Ue{constructor(){this.rotation=0}init(e,t){}update(e,t){return this.rotation+=.2*e,he(V(),this.rotation)}}class Me{constructor(e){this.container=e,this.time=0,N.loadImages(["panorama_1.jpg","panorama_2.jpg"]).then(t=>{this.renderer=B.createTemporary(this.container,Ie,{useSharedContext:!1}),this.renderer.createBuffer(0,ze),this.renderer.buffers[0].setImage(0,t[0],{clampX:!1,flipY:!0,useMipmap:!0}),this.renderer.buffers[0].setImage(1,t[1],{clampX:!1,flipY:!0,useMipmap:!0}),this.renderer.setImage(0,this.renderer.buffers[0]),this.panorama=new X(this.container,null,{fov:90,rotationController:new Ue,controlledRendererInstance:this.renderer.buffers[0]}),this.panorama.play(),this.panorama.tick(s=>{this.time+=s,this.renderer.buffers[0].setUniformFloat("uMix",Math.abs(this.time/10%1-.5)*2)})})}}class Se{constructor(e){this.container=e,this.hotspots=[],this.hotspotVisuals=[],N.loadImages(["panorama_1.jpg"]).then(t=>{this.renderer=new X(e,t[0],{rotationControllerOptions:{userInteractions:!1}}),this.renderer.play();const s={x:.5,y:.5,z:1};this.createHotspot(s),this.renderer.lookAt(s),this.renderer.canvas.onmousedown=i=>{const n=this.renderer.canvas.getBoundingClientRect(),a=(i.clientX-n.left)/n.width,c=(i.clientY-n.top)/n.height;if(a>=0&&a<=1&&c>=0&&c<=1){const h=this.renderer.screenToWorld({x:a,y:c});this.createHotspot(h),this.renderer.lookAt(h,2)}},this.renderer.tick(()=>this.tick())})}createHotspot(e){const t=document.createElement("div");t.style.zIndex="1",t.style.width="16px",t.style.height="16px",t.style.marginLeft="-8px",t.style.marginTop="-8px",t.style.borderRadius="8px",t.style.backgroundColor="#FF0000",t.style.position="absolute",this.container.appendChild(t),this.hotspotVisuals.push(t),this.hotspots.push(e)}tick(){for(let e=0;e<this.hotspots.length;e++){const t=this.hotspots[e],s=this.renderer.worldToScreen(t);if(s.z>0&&s.x>0&&s.x<1&&s.y>=0&&s.y<1){const i=s.x*100,n=s.y*100;this.hotspotVisuals[e].style.left=i+"%",this.hotspotVisuals[e].style.top=n+"%",this.hotspotVisuals[e].style.display="block"}else this.hotspotVisuals[e].style.display="none"}}}new Se(document.getElementsByClassName("grid-item")[0]);new Le(document.getElementsByClassName("grid-item")[1]);new Me(document.getElementsByClassName("grid-item")[2]);
