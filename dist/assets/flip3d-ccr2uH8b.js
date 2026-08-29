const YA="srgb",it="srgb-linear",as="display-p3",vi="display-p3-linear",ai="linear",GA="srgb",si="rec709";const Ls="300 es";class Br{addEventListener(A,e){this._listeners===void 0&&(this._listeners={});const t=this._listeners;t[A]===void 0&&(t[A]=[]),t[A].indexOf(e)===-1&&t[A].push(e)}hasEventListener(A,e){if(this._listeners===void 0)return!1;const t=this._listeners;return t[A]!==void 0&&t[A].indexOf(e)!==-1}removeEventListener(A,e){if(this._listeners===void 0)return;const t=this._listeners[A];if(t!==void 0){const n=t.indexOf(e);n!==-1&&t.splice(n,1)}}dispatchEvent(A){if(this._listeners===void 0)return;const e=this._listeners[A.type];if(e!==void 0){A.target=this;const t=e.slice(0);for(let n=0,i=t.length;n<i;n++)t[n].call(this,A);A.target=null}}}const se=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ni=Math.PI/180,La=180/Math.PI;function qr(){const r=4294967295*Math.random()|0,A=4294967295*Math.random()|0,e=4294967295*Math.random()|0,t=4294967295*Math.random()|0;return(se[255&r]+se[r>>8&255]+se[r>>16&255]+se[r>>24&255]+"-"+se[255&A]+se[A>>8&255]+"-"+se[A>>16&15|64]+se[A>>24&255]+"-"+se[63&e|128]+se[e>>8&255]+"-"+se[e>>16&255]+se[e>>24&255]+se[255&t]+se[t>>8&255]+se[t>>16&255]+se[t>>24&255]).toLowerCase()}function ve(r,A,e){return Math.max(A,Math.min(e,r))}function au(r,A){return(r%A+A)%A}function Gi(r,A,e){return(1-e)*r+e*A}function Rs(r){return(r&r-1)==0&&r!==0}function Ra(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function Ur(r,A){switch(A.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("Invalid component type.")}}function ge(r,A){switch(A.constructor){case Float32Array:return r;case Uint32Array:return Math.round(4294967295*r);case Uint16Array:return Math.round(65535*r);case Uint8Array:return Math.round(255*r);case Int32Array:return Math.round(2147483647*r);case Int16Array:return Math.round(32767*r);case Int8Array:return Math.round(127*r);default:throw new Error("Invalid component type.")}}class TA{constructor(A=0,e=0){TA.prototype.isVector2=!0,this.x=A,this.y=e}get width(){return this.x}set width(A){this.x=A}get height(){return this.y}set height(A){this.y=A}set(A,e){return this.x=A,this.y=e,this}setScalar(A){return this.x=A,this.y=A,this}setX(A){return this.x=A,this}setY(A){return this.y=A,this}setComponent(A,e){switch(A){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+A)}return this}getComponent(A){switch(A){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+A)}}clone(){return new this.constructor(this.x,this.y)}copy(A){return this.x=A.x,this.y=A.y,this}add(A){return this.x+=A.x,this.y+=A.y,this}addScalar(A){return this.x+=A,this.y+=A,this}addVectors(A,e){return this.x=A.x+e.x,this.y=A.y+e.y,this}addScaledVector(A,e){return this.x+=A.x*e,this.y+=A.y*e,this}sub(A){return this.x-=A.x,this.y-=A.y,this}subScalar(A){return this.x-=A,this.y-=A,this}subVectors(A,e){return this.x=A.x-e.x,this.y=A.y-e.y,this}multiply(A){return this.x*=A.x,this.y*=A.y,this}multiplyScalar(A){return this.x*=A,this.y*=A,this}divide(A){return this.x/=A.x,this.y/=A.y,this}divideScalar(A){return this.multiplyScalar(1/A)}applyMatrix3(A){const e=this.x,t=this.y,n=A.elements;return this.x=n[0]*e+n[3]*t+n[6],this.y=n[1]*e+n[4]*t+n[7],this}min(A){return this.x=Math.min(this.x,A.x),this.y=Math.min(this.y,A.y),this}max(A){return this.x=Math.max(this.x,A.x),this.y=Math.max(this.y,A.y),this}clamp(A,e){return this.x=Math.max(A.x,Math.min(e.x,this.x)),this.y=Math.max(A.y,Math.min(e.y,this.y)),this}clampScalar(A,e){return this.x=Math.max(A,Math.min(e,this.x)),this.y=Math.max(A,Math.min(e,this.y)),this}clampLength(A,e){const t=this.length();return this.divideScalar(t||1).multiplyScalar(Math.max(A,Math.min(e,t)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(A){return this.x*A.x+this.y*A.y}cross(A){return this.x*A.y-this.y*A.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(A){const e=Math.sqrt(this.lengthSq()*A.lengthSq());if(e===0)return Math.PI/2;const t=this.dot(A)/e;return Math.acos(ve(t,-1,1))}distanceTo(A){return Math.sqrt(this.distanceToSquared(A))}distanceToSquared(A){const e=this.x-A.x,t=this.y-A.y;return e*e+t*t}manhattanDistanceTo(A){return Math.abs(this.x-A.x)+Math.abs(this.y-A.y)}setLength(A){return this.normalize().multiplyScalar(A)}lerp(A,e){return this.x+=(A.x-this.x)*e,this.y+=(A.y-this.y)*e,this}lerpVectors(A,e,t){return this.x=A.x+(e.x-A.x)*t,this.y=A.y+(e.y-A.y)*t,this}equals(A){return A.x===this.x&&A.y===this.y}fromArray(A,e=0){return this.x=A[e],this.y=A[e+1],this}toArray(A=[],e=0){return A[e]=this.x,A[e+1]=this.y,A}fromBufferAttribute(A,e){return this.x=A.getX(e),this.y=A.getY(e),this}rotateAround(A,e){const t=Math.cos(e),n=Math.sin(e),i=this.x-A.x,a=this.y-A.y;return this.x=i*t-a*n+A.x,this.y=i*n+a*t+A.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class UA{constructor(A,e,t,n,i,a,o,s,l){UA.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],A!==void 0&&this.set(A,e,t,n,i,a,o,s,l)}set(A,e,t,n,i,a,o,s,l){const c=this.elements;return c[0]=A,c[1]=n,c[2]=o,c[3]=e,c[4]=i,c[5]=s,c[6]=t,c[7]=a,c[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(A){const e=this.elements,t=A.elements;return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],this}extractBasis(A,e,t){return A.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),t.setFromMatrix3Column(this,2),this}setFromMatrix4(A){const e=A.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(A){return this.multiplyMatrices(this,A)}premultiply(A){return this.multiplyMatrices(A,this)}multiplyMatrices(A,e){const t=A.elements,n=e.elements,i=this.elements,a=t[0],o=t[3],s=t[6],l=t[1],c=t[4],u=t[7],h=t[2],d=t[5],g=t[8],m=n[0],f=n[3],v=n[6],p=n[1],B=n[4],T=n[7],S=n[2],E=n[5],x=n[8];return i[0]=a*m+o*p+s*S,i[3]=a*f+o*B+s*E,i[6]=a*v+o*T+s*x,i[1]=l*m+c*p+u*S,i[4]=l*f+c*B+u*E,i[7]=l*v+c*T+u*x,i[2]=h*m+d*p+g*S,i[5]=h*f+d*B+g*E,i[8]=h*v+d*T+g*x,this}multiplyScalar(A){const e=this.elements;return e[0]*=A,e[3]*=A,e[6]*=A,e[1]*=A,e[4]*=A,e[7]*=A,e[2]*=A,e[5]*=A,e[8]*=A,this}determinant(){const A=this.elements,e=A[0],t=A[1],n=A[2],i=A[3],a=A[4],o=A[5],s=A[6],l=A[7],c=A[8];return e*a*c-e*o*l-t*i*c+t*o*s+n*i*l-n*a*s}invert(){const A=this.elements,e=A[0],t=A[1],n=A[2],i=A[3],a=A[4],o=A[5],s=A[6],l=A[7],c=A[8],u=c*a-o*l,h=o*s-c*i,d=l*i-a*s,g=e*u+t*h+n*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const m=1/g;return A[0]=u*m,A[1]=(n*l-c*t)*m,A[2]=(o*t-n*a)*m,A[3]=h*m,A[4]=(c*e-n*s)*m,A[5]=(n*i-o*e)*m,A[6]=d*m,A[7]=(t*s-l*e)*m,A[8]=(a*e-t*i)*m,this}transpose(){let A;const e=this.elements;return A=e[1],e[1]=e[3],e[3]=A,A=e[2],e[2]=e[6],e[6]=A,A=e[5],e[5]=e[7],e[7]=A,this}getNormalMatrix(A){return this.setFromMatrix4(A).invert().transpose()}transposeIntoArray(A){const e=this.elements;return A[0]=e[0],A[1]=e[3],A[2]=e[6],A[3]=e[1],A[4]=e[4],A[5]=e[7],A[6]=e[2],A[7]=e[5],A[8]=e[8],this}setUvTransform(A,e,t,n,i,a,o){const s=Math.cos(i),l=Math.sin(i);return this.set(t*s,t*l,-t*(s*a+l*o)+a+A,-n*l,n*s,-n*(-l*a+s*o)+o+e,0,0,1),this}scale(A,e){return this.premultiply(Vi.makeScale(A,e)),this}rotate(A){return this.premultiply(Vi.makeRotation(-A)),this}translate(A,e){return this.premultiply(Vi.makeTranslation(A,e)),this}makeTranslation(A,e){return A.isVector2?this.set(1,0,A.x,0,1,A.y,0,0,1):this.set(1,0,A,0,1,e,0,0,1),this}makeRotation(A){const e=Math.cos(A),t=Math.sin(A);return this.set(e,-t,0,t,e,0,0,0,1),this}makeScale(A,e){return this.set(A,0,0,0,e,0,0,0,1),this}equals(A){const e=this.elements,t=A.elements;for(let n=0;n<9;n++)if(e[n]!==t[n])return!1;return!0}fromArray(A,e=0){for(let t=0;t<9;t++)this.elements[t]=A[t+e];return this}toArray(A=[],e=0){const t=this.elements;return A[e]=t[0],A[e+1]=t[1],A[e+2]=t[2],A[e+3]=t[3],A[e+4]=t[4],A[e+5]=t[5],A[e+6]=t[6],A[e+7]=t[7],A[e+8]=t[8],A}clone(){return new this.constructor().fromArray(this.elements)}}const Vi=new UA;function Ml(r){for(let A=r.length-1;A>=0;--A)if(r[A]>=65535)return!0;return!1}function oi(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function su(){const r=oi("canvas");return r.style.display="block",r}const Hs={};function Vr(r){r in Hs||(Hs[r]=!0,console.warn(r))}const Ds=new UA().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Ps=new UA().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),cn={[it]:{transfer:ai,primaries:si,toReference:r=>r,fromReference:r=>r},[YA]:{transfer:GA,primaries:si,toReference:r=>r.convertSRGBToLinear(),fromReference:r=>r.convertLinearToSRGB()},[vi]:{transfer:ai,primaries:"p3",toReference:r=>r.applyMatrix3(Ps),fromReference:r=>r.applyMatrix3(Ds)},[as]:{transfer:GA,primaries:"p3",toReference:r=>r.convertSRGBToLinear().applyMatrix3(Ps),fromReference:r=>r.applyMatrix3(Ds).convertLinearToSRGB()}},ou=new Set([it,vi]),PA={enabled:!0,_workingColorSpace:it,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(r){if(!ou.has(r))throw new Error(`Unsupported working color space, "${r}".`);this._workingColorSpace=r},convert:function(r,A,e){if(this.enabled===!1||A===e||!A||!e)return r;const t=cn[A].toReference;return(0,cn[e].fromReference)(t(r))},fromWorkingColorSpace:function(r,A){return this.convert(r,this._workingColorSpace,A)},toWorkingColorSpace:function(r,A){return this.convert(r,A,this._workingColorSpace)},getPrimaries:function(r){return cn[r].primaries},getTransfer:function(r){return r===""?ai:cn[r].transfer}};function fr(r){return r<.04045?.0773993808*r:Math.pow(.9478672986*r+.0521327014,2.4)}function Ki(r){return r<.0031308?12.92*r:1.055*Math.pow(r,.41666)-.055}let kt;class Sl{static getDataURL(A){if(/^data:/i.test(A.src)||typeof HTMLCanvasElement>"u")return A.src;let e;if(A instanceof HTMLCanvasElement)e=A;else{kt===void 0&&(kt=oi("canvas")),kt.width=A.width,kt.height=A.height;const t=kt.getContext("2d");A instanceof ImageData?t.putImageData(A,0,0):t.drawImage(A,0,0,A.width,A.height),e=kt}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",A),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(A){if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap){const e=oi("canvas");e.width=A.width,e.height=A.height;const t=e.getContext("2d");t.drawImage(A,0,0,A.width,A.height);const n=t.getImageData(0,0,A.width,A.height),i=n.data;for(let a=0;a<i.length;a++)i[a]=255*fr(i[a]/255);return t.putImageData(n,0,0),e}if(A.data){const e=A.data.slice(0);for(let t=0;t<e.length;t++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[t]=Math.floor(255*fr(e[t]/255)):e[t]=fr(e[t]);return{data:e,width:A.width,height:A.height}}return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),A}}let lu=0;class Fl{constructor(A=null){this.isSource=!0,Object.defineProperty(this,"id",{value:lu++}),this.uuid=qr(),this.data=A,this.version=0}set needsUpdate(A){A===!0&&this.version++}toJSON(A){const e=A===void 0||typeof A=="string";if(!e&&A.images[this.uuid]!==void 0)return A.images[this.uuid];const t={uuid:this.uuid,url:""},n=this.data;if(n!==null){let i;if(Array.isArray(n)){i=[];for(let a=0,o=n.length;a<o;a++)n[a].isDataTexture?i.push(ki(n[a].image)):i.push(ki(n[a]))}else i=ki(n);t.url=i}return e||(A.images[this.uuid]=t),t}}function ki(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?Sl.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let cu=0;class we extends Br{constructor(A=we.DEFAULT_IMAGE,e=we.DEFAULT_MAPPING,t=1001,n=1001,i=1006,a=1008,o=1023,s=1009,l=we.DEFAULT_ANISOTROPY,c=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:cu++}),this.uuid=qr(),this.name="",this.source=new Fl(A),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=t,this.wrapT=n,this.magFilter=i,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=s,this.offset=new TA(0,0),this.repeat=new TA(1,1),this.center=new TA(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new UA,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof c=="string"?this.colorSpace=c:(Vr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=c===3001?YA:""),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(A=null){this.source.data=A}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(A){return this.name=A.name,this.source=A.source,this.mipmaps=A.mipmaps.slice(0),this.mapping=A.mapping,this.channel=A.channel,this.wrapS=A.wrapS,this.wrapT=A.wrapT,this.magFilter=A.magFilter,this.minFilter=A.minFilter,this.anisotropy=A.anisotropy,this.format=A.format,this.internalFormat=A.internalFormat,this.type=A.type,this.offset.copy(A.offset),this.repeat.copy(A.repeat),this.center.copy(A.center),this.rotation=A.rotation,this.matrixAutoUpdate=A.matrixAutoUpdate,this.matrix.copy(A.matrix),this.generateMipmaps=A.generateMipmaps,this.premultiplyAlpha=A.premultiplyAlpha,this.flipY=A.flipY,this.unpackAlignment=A.unpackAlignment,this.colorSpace=A.colorSpace,this.userData=JSON.parse(JSON.stringify(A.userData)),this.needsUpdate=!0,this}toJSON(A){const e=A===void 0||typeof A=="string";if(!e&&A.textures[this.uuid]!==void 0)return A.textures[this.uuid];const t={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(A).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(t.userData=this.userData),e||(A.textures[this.uuid]=t),t}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(A){if(this.mapping!==300)return A;if(A.applyMatrix3(this.matrix),A.x<0||A.x>1)switch(this.wrapS){case 1e3:A.x=A.x-Math.floor(A.x);break;case 1001:A.x=A.x<0?0:1;break;case 1002:Math.abs(Math.floor(A.x)%2)===1?A.x=Math.ceil(A.x)-A.x:A.x=A.x-Math.floor(A.x)}if(A.y<0||A.y>1)switch(this.wrapT){case 1e3:A.y=A.y-Math.floor(A.y);break;case 1001:A.y=A.y<0?0:1;break;case 1002:Math.abs(Math.floor(A.y)%2)===1?A.y=Math.ceil(A.y)-A.y:A.y=A.y-Math.floor(A.y)}return this.flipY&&(A.y=1-A.y),A}set needsUpdate(A){A===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Vr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===YA?3001:3e3}set encoding(A){Vr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=A===3001?YA:""}}we.DEFAULT_IMAGE=null,we.DEFAULT_MAPPING=300,we.DEFAULT_ANISOTROPY=1;class ZA{constructor(A=0,e=0,t=0,n=1){ZA.prototype.isVector4=!0,this.x=A,this.y=e,this.z=t,this.w=n}get width(){return this.z}set width(A){this.z=A}get height(){return this.w}set height(A){this.w=A}set(A,e,t,n){return this.x=A,this.y=e,this.z=t,this.w=n,this}setScalar(A){return this.x=A,this.y=A,this.z=A,this.w=A,this}setX(A){return this.x=A,this}setY(A){return this.y=A,this}setZ(A){return this.z=A,this}setW(A){return this.w=A,this}setComponent(A,e){switch(A){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+A)}return this}getComponent(A){switch(A){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+A)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(A){return this.x=A.x,this.y=A.y,this.z=A.z,this.w=A.w!==void 0?A.w:1,this}add(A){return this.x+=A.x,this.y+=A.y,this.z+=A.z,this.w+=A.w,this}addScalar(A){return this.x+=A,this.y+=A,this.z+=A,this.w+=A,this}addVectors(A,e){return this.x=A.x+e.x,this.y=A.y+e.y,this.z=A.z+e.z,this.w=A.w+e.w,this}addScaledVector(A,e){return this.x+=A.x*e,this.y+=A.y*e,this.z+=A.z*e,this.w+=A.w*e,this}sub(A){return this.x-=A.x,this.y-=A.y,this.z-=A.z,this.w-=A.w,this}subScalar(A){return this.x-=A,this.y-=A,this.z-=A,this.w-=A,this}subVectors(A,e){return this.x=A.x-e.x,this.y=A.y-e.y,this.z=A.z-e.z,this.w=A.w-e.w,this}multiply(A){return this.x*=A.x,this.y*=A.y,this.z*=A.z,this.w*=A.w,this}multiplyScalar(A){return this.x*=A,this.y*=A,this.z*=A,this.w*=A,this}applyMatrix4(A){const e=this.x,t=this.y,n=this.z,i=this.w,a=A.elements;return this.x=a[0]*e+a[4]*t+a[8]*n+a[12]*i,this.y=a[1]*e+a[5]*t+a[9]*n+a[13]*i,this.z=a[2]*e+a[6]*t+a[10]*n+a[14]*i,this.w=a[3]*e+a[7]*t+a[11]*n+a[15]*i,this}divideScalar(A){return this.multiplyScalar(1/A)}setAxisAngleFromQuaternion(A){this.w=2*Math.acos(A.w);const e=Math.sqrt(1-A.w*A.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=A.x/e,this.y=A.y/e,this.z=A.z/e),this}setAxisAngleFromRotationMatrix(A){let e,t,n,i;const s=A.elements,l=s[0],c=s[4],u=s[8],h=s[1],d=s[5],g=s[9],m=s[2],f=s[6],v=s[10];if(Math.abs(c-h)<.01&&Math.abs(u-m)<.01&&Math.abs(g-f)<.01){if(Math.abs(c+h)<.1&&Math.abs(u+m)<.1&&Math.abs(g+f)<.1&&Math.abs(l+d+v-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const B=(l+1)/2,T=(d+1)/2,S=(v+1)/2,E=(c+h)/4,x=(u+m)/4,I=(g+f)/4;return B>T&&B>S?B<.01?(t=0,n=.707106781,i=.707106781):(t=Math.sqrt(B),n=E/t,i=x/t):T>S?T<.01?(t=.707106781,n=0,i=.707106781):(n=Math.sqrt(T),t=E/n,i=I/n):S<.01?(t=.707106781,n=.707106781,i=0):(i=Math.sqrt(S),t=x/i,n=I/i),this.set(t,n,i,e),this}let p=Math.sqrt((f-g)*(f-g)+(u-m)*(u-m)+(h-c)*(h-c));return Math.abs(p)<.001&&(p=1),this.x=(f-g)/p,this.y=(u-m)/p,this.z=(h-c)/p,this.w=Math.acos((l+d+v-1)/2),this}min(A){return this.x=Math.min(this.x,A.x),this.y=Math.min(this.y,A.y),this.z=Math.min(this.z,A.z),this.w=Math.min(this.w,A.w),this}max(A){return this.x=Math.max(this.x,A.x),this.y=Math.max(this.y,A.y),this.z=Math.max(this.z,A.z),this.w=Math.max(this.w,A.w),this}clamp(A,e){return this.x=Math.max(A.x,Math.min(e.x,this.x)),this.y=Math.max(A.y,Math.min(e.y,this.y)),this.z=Math.max(A.z,Math.min(e.z,this.z)),this.w=Math.max(A.w,Math.min(e.w,this.w)),this}clampScalar(A,e){return this.x=Math.max(A,Math.min(e,this.x)),this.y=Math.max(A,Math.min(e,this.y)),this.z=Math.max(A,Math.min(e,this.z)),this.w=Math.max(A,Math.min(e,this.w)),this}clampLength(A,e){const t=this.length();return this.divideScalar(t||1).multiplyScalar(Math.max(A,Math.min(e,t)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(A){return this.x*A.x+this.y*A.y+this.z*A.z+this.w*A.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(A){return this.normalize().multiplyScalar(A)}lerp(A,e){return this.x+=(A.x-this.x)*e,this.y+=(A.y-this.y)*e,this.z+=(A.z-this.z)*e,this.w+=(A.w-this.w)*e,this}lerpVectors(A,e,t){return this.x=A.x+(e.x-A.x)*t,this.y=A.y+(e.y-A.y)*t,this.z=A.z+(e.z-A.z)*t,this.w=A.w+(e.w-A.w)*t,this}equals(A){return A.x===this.x&&A.y===this.y&&A.z===this.z&&A.w===this.w}fromArray(A,e=0){return this.x=A[e],this.y=A[e+1],this.z=A[e+2],this.w=A[e+3],this}toArray(A=[],e=0){return A[e]=this.x,A[e+1]=this.y,A[e+2]=this.z,A[e+3]=this.w,A}fromBufferAttribute(A,e){return this.x=A.getX(e),this.y=A.getY(e),this.z=A.getZ(e),this.w=A.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class uu extends Br{constructor(A=1,e=1,t={}){super(),this.isRenderTarget=!0,this.width=A,this.height=e,this.depth=1,this.scissor=new ZA(0,0,A,e),this.scissorTest=!1,this.viewport=new ZA(0,0,A,e);const n={width:A,height:e,depth:1};t.encoding!==void 0&&(Vr("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===3001?YA:""),t=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},t),this.texture=new we(n,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=t.generateMipmaps,this.texture.internalFormat=t.internalFormat,this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.depthTexture=t.depthTexture,this.samples=t.samples}setSize(A,e,t=1){this.width===A&&this.height===e&&this.depth===t||(this.width=A,this.height=e,this.depth=t,this.texture.image.width=A,this.texture.image.height=e,this.texture.image.depth=t,this.dispose()),this.viewport.set(0,0,A,e),this.scissor.set(0,0,A,e)}clone(){return new this.constructor().copy(this)}copy(A){this.width=A.width,this.height=A.height,this.depth=A.depth,this.scissor.copy(A.scissor),this.scissorTest=A.scissorTest,this.viewport.copy(A.viewport),this.texture=A.texture.clone(),this.texture.isRenderTargetTexture=!0;const e=Object.assign({},A.texture.image);return this.texture.source=new Fl(e),this.depthBuffer=A.depthBuffer,this.stencilBuffer=A.stencilBuffer,A.depthTexture!==null&&(this.depthTexture=A.depthTexture.clone()),this.samples=A.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ot extends uu{constructor(A=1,e=1,t={}){super(A,e,t),this.isWebGLRenderTarget=!0}}class Tl extends we{constructor(A=null,e=1,t=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:A,width:e,height:t,depth:n},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class hu extends we{constructor(A=null,e=1,t=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:A,width:e,height:t,depth:n},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class jr{constructor(A=0,e=0,t=0,n=1){this.isQuaternion=!0,this._x=A,this._y=e,this._z=t,this._w=n}static slerpFlat(A,e,t,n,i,a,o){let s=t[n+0],l=t[n+1],c=t[n+2],u=t[n+3];const h=i[a+0],d=i[a+1],g=i[a+2],m=i[a+3];if(o===0)return A[e+0]=s,A[e+1]=l,A[e+2]=c,void(A[e+3]=u);if(o===1)return A[e+0]=h,A[e+1]=d,A[e+2]=g,void(A[e+3]=m);if(u!==m||s!==h||l!==d||c!==g){let f=1-o;const v=s*h+l*d+c*g+u*m,p=v>=0?1:-1,B=1-v*v;if(B>Number.EPSILON){const S=Math.sqrt(B),E=Math.atan2(S,v*p);f=Math.sin(f*E)/S,o=Math.sin(o*E)/S}const T=o*p;if(s=s*f+h*T,l=l*f+d*T,c=c*f+g*T,u=u*f+m*T,f===1-o){const S=1/Math.sqrt(s*s+l*l+c*c+u*u);s*=S,l*=S,c*=S,u*=S}}A[e]=s,A[e+1]=l,A[e+2]=c,A[e+3]=u}static multiplyQuaternionsFlat(A,e,t,n,i,a){const o=t[n],s=t[n+1],l=t[n+2],c=t[n+3],u=i[a],h=i[a+1],d=i[a+2],g=i[a+3];return A[e]=o*g+c*u+s*d-l*h,A[e+1]=s*g+c*h+l*u-o*d,A[e+2]=l*g+c*d+o*h-s*u,A[e+3]=c*g-o*u-s*h-l*d,A}get x(){return this._x}set x(A){this._x=A,this._onChangeCallback()}get y(){return this._y}set y(A){this._y=A,this._onChangeCallback()}get z(){return this._z}set z(A){this._z=A,this._onChangeCallback()}get w(){return this._w}set w(A){this._w=A,this._onChangeCallback()}set(A,e,t,n){return this._x=A,this._y=e,this._z=t,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(A){return this._x=A.x,this._y=A.y,this._z=A.z,this._w=A.w,this._onChangeCallback(),this}setFromEuler(A,e=!0){const t=A._x,n=A._y,i=A._z,a=A._order,o=Math.cos,s=Math.sin,l=o(t/2),c=o(n/2),u=o(i/2),h=s(t/2),d=s(n/2),g=s(i/2);switch(a){case"XYZ":this._x=h*c*u+l*d*g,this._y=l*d*u-h*c*g,this._z=l*c*g+h*d*u,this._w=l*c*u-h*d*g;break;case"YXZ":this._x=h*c*u+l*d*g,this._y=l*d*u-h*c*g,this._z=l*c*g-h*d*u,this._w=l*c*u+h*d*g;break;case"ZXY":this._x=h*c*u-l*d*g,this._y=l*d*u+h*c*g,this._z=l*c*g+h*d*u,this._w=l*c*u-h*d*g;break;case"ZYX":this._x=h*c*u-l*d*g,this._y=l*d*u+h*c*g,this._z=l*c*g-h*d*u,this._w=l*c*u+h*d*g;break;case"YZX":this._x=h*c*u+l*d*g,this._y=l*d*u+h*c*g,this._z=l*c*g-h*d*u,this._w=l*c*u-h*d*g;break;case"XZY":this._x=h*c*u-l*d*g,this._y=l*d*u-h*c*g,this._z=l*c*g+h*d*u,this._w=l*c*u+h*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(A,e){const t=e/2,n=Math.sin(t);return this._x=A.x*n,this._y=A.y*n,this._z=A.z*n,this._w=Math.cos(t),this._onChangeCallback(),this}setFromRotationMatrix(A){const e=A.elements,t=e[0],n=e[4],i=e[8],a=e[1],o=e[5],s=e[9],l=e[2],c=e[6],u=e[10],h=t+o+u;if(h>0){const d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(c-s)*d,this._y=(i-l)*d,this._z=(a-n)*d}else if(t>o&&t>u){const d=2*Math.sqrt(1+t-o-u);this._w=(c-s)/d,this._x=.25*d,this._y=(n+a)/d,this._z=(i+l)/d}else if(o>u){const d=2*Math.sqrt(1+o-t-u);this._w=(i-l)/d,this._x=(n+a)/d,this._y=.25*d,this._z=(s+c)/d}else{const d=2*Math.sqrt(1+u-t-o);this._w=(a-n)/d,this._x=(i+l)/d,this._y=(s+c)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(A,e){let t=A.dot(e)+1;return t<Number.EPSILON?(t=0,Math.abs(A.x)>Math.abs(A.z)?(this._x=-A.y,this._y=A.x,this._z=0,this._w=t):(this._x=0,this._y=-A.z,this._z=A.y,this._w=t)):(this._x=A.y*e.z-A.z*e.y,this._y=A.z*e.x-A.x*e.z,this._z=A.x*e.y-A.y*e.x,this._w=t),this.normalize()}angleTo(A){return 2*Math.acos(Math.abs(ve(this.dot(A),-1,1)))}rotateTowards(A,e){const t=this.angleTo(A);if(t===0)return this;const n=Math.min(1,e/t);return this.slerp(A,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(A){return this._x*A._x+this._y*A._y+this._z*A._z+this._w*A._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let A=this.length();return A===0?(this._x=0,this._y=0,this._z=0,this._w=1):(A=1/A,this._x=this._x*A,this._y=this._y*A,this._z=this._z*A,this._w=this._w*A),this._onChangeCallback(),this}multiply(A){return this.multiplyQuaternions(this,A)}premultiply(A){return this.multiplyQuaternions(A,this)}multiplyQuaternions(A,e){const t=A._x,n=A._y,i=A._z,a=A._w,o=e._x,s=e._y,l=e._z,c=e._w;return this._x=t*c+a*o+n*l-i*s,this._y=n*c+a*s+i*o-t*l,this._z=i*c+a*l+t*s-n*o,this._w=a*c-t*o-n*s-i*l,this._onChangeCallback(),this}slerp(A,e){if(e===0)return this;if(e===1)return this.copy(A);const t=this._x,n=this._y,i=this._z,a=this._w;let o=a*A._w+t*A._x+n*A._y+i*A._z;if(o<0?(this._w=-A._w,this._x=-A._x,this._y=-A._y,this._z=-A._z,o=-o):this.copy(A),o>=1)return this._w=a,this._x=t,this._y=n,this._z=i,this;const s=1-o*o;if(s<=Number.EPSILON){const d=1-e;return this._w=d*a+e*this._w,this._x=d*t+e*this._x,this._y=d*n+e*this._y,this._z=d*i+e*this._z,this.normalize(),this}const l=Math.sqrt(s),c=Math.atan2(l,o),u=Math.sin((1-e)*c)/l,h=Math.sin(e*c)/l;return this._w=a*u+this._w*h,this._x=t*u+this._x*h,this._y=n*u+this._y*h,this._z=i*u+this._z*h,this._onChangeCallback(),this}slerpQuaternions(A,e,t){return this.copy(A).slerp(e,t)}random(){const A=Math.random(),e=Math.sqrt(1-A),t=Math.sqrt(A),n=2*Math.PI*Math.random(),i=2*Math.PI*Math.random();return this.set(e*Math.cos(n),t*Math.sin(i),t*Math.cos(i),e*Math.sin(n))}equals(A){return A._x===this._x&&A._y===this._y&&A._z===this._z&&A._w===this._w}fromArray(A,e=0){return this._x=A[e],this._y=A[e+1],this._z=A[e+2],this._w=A[e+3],this._onChangeCallback(),this}toArray(A=[],e=0){return A[e]=this._x,A[e+1]=this._y,A[e+2]=this._z,A[e+3]=this._w,A}fromBufferAttribute(A,e){return this._x=A.getX(e),this._y=A.getY(e),this._z=A.getZ(e),this._w=A.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(A){return this._onChangeCallback=A,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class Q{constructor(A=0,e=0,t=0){Q.prototype.isVector3=!0,this.x=A,this.y=e,this.z=t}set(A,e,t){return t===void 0&&(t=this.z),this.x=A,this.y=e,this.z=t,this}setScalar(A){return this.x=A,this.y=A,this.z=A,this}setX(A){return this.x=A,this}setY(A){return this.y=A,this}setZ(A){return this.z=A,this}setComponent(A,e){switch(A){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+A)}return this}getComponent(A){switch(A){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+A)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(A){return this.x=A.x,this.y=A.y,this.z=A.z,this}add(A){return this.x+=A.x,this.y+=A.y,this.z+=A.z,this}addScalar(A){return this.x+=A,this.y+=A,this.z+=A,this}addVectors(A,e){return this.x=A.x+e.x,this.y=A.y+e.y,this.z=A.z+e.z,this}addScaledVector(A,e){return this.x+=A.x*e,this.y+=A.y*e,this.z+=A.z*e,this}sub(A){return this.x-=A.x,this.y-=A.y,this.z-=A.z,this}subScalar(A){return this.x-=A,this.y-=A,this.z-=A,this}subVectors(A,e){return this.x=A.x-e.x,this.y=A.y-e.y,this.z=A.z-e.z,this}multiply(A){return this.x*=A.x,this.y*=A.y,this.z*=A.z,this}multiplyScalar(A){return this.x*=A,this.y*=A,this.z*=A,this}multiplyVectors(A,e){return this.x=A.x*e.x,this.y=A.y*e.y,this.z=A.z*e.z,this}applyEuler(A){return this.applyQuaternion(Os.setFromEuler(A))}applyAxisAngle(A,e){return this.applyQuaternion(Os.setFromAxisAngle(A,e))}applyMatrix3(A){const e=this.x,t=this.y,n=this.z,i=A.elements;return this.x=i[0]*e+i[3]*t+i[6]*n,this.y=i[1]*e+i[4]*t+i[7]*n,this.z=i[2]*e+i[5]*t+i[8]*n,this}applyNormalMatrix(A){return this.applyMatrix3(A).normalize()}applyMatrix4(A){const e=this.x,t=this.y,n=this.z,i=A.elements,a=1/(i[3]*e+i[7]*t+i[11]*n+i[15]);return this.x=(i[0]*e+i[4]*t+i[8]*n+i[12])*a,this.y=(i[1]*e+i[5]*t+i[9]*n+i[13])*a,this.z=(i[2]*e+i[6]*t+i[10]*n+i[14])*a,this}applyQuaternion(A){const e=this.x,t=this.y,n=this.z,i=A.x,a=A.y,o=A.z,s=A.w,l=2*(a*n-o*t),c=2*(o*e-i*n),u=2*(i*t-a*e);return this.x=e+s*l+a*u-o*c,this.y=t+s*c+o*l-i*u,this.z=n+s*u+i*c-a*l,this}project(A){return this.applyMatrix4(A.matrixWorldInverse).applyMatrix4(A.projectionMatrix)}unproject(A){return this.applyMatrix4(A.projectionMatrixInverse).applyMatrix4(A.matrixWorld)}transformDirection(A){const e=this.x,t=this.y,n=this.z,i=A.elements;return this.x=i[0]*e+i[4]*t+i[8]*n,this.y=i[1]*e+i[5]*t+i[9]*n,this.z=i[2]*e+i[6]*t+i[10]*n,this.normalize()}divide(A){return this.x/=A.x,this.y/=A.y,this.z/=A.z,this}divideScalar(A){return this.multiplyScalar(1/A)}min(A){return this.x=Math.min(this.x,A.x),this.y=Math.min(this.y,A.y),this.z=Math.min(this.z,A.z),this}max(A){return this.x=Math.max(this.x,A.x),this.y=Math.max(this.y,A.y),this.z=Math.max(this.z,A.z),this}clamp(A,e){return this.x=Math.max(A.x,Math.min(e.x,this.x)),this.y=Math.max(A.y,Math.min(e.y,this.y)),this.z=Math.max(A.z,Math.min(e.z,this.z)),this}clampScalar(A,e){return this.x=Math.max(A,Math.min(e,this.x)),this.y=Math.max(A,Math.min(e,this.y)),this.z=Math.max(A,Math.min(e,this.z)),this}clampLength(A,e){const t=this.length();return this.divideScalar(t||1).multiplyScalar(Math.max(A,Math.min(e,t)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(A){return this.x*A.x+this.y*A.y+this.z*A.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(A){return this.normalize().multiplyScalar(A)}lerp(A,e){return this.x+=(A.x-this.x)*e,this.y+=(A.y-this.y)*e,this.z+=(A.z-this.z)*e,this}lerpVectors(A,e,t){return this.x=A.x+(e.x-A.x)*t,this.y=A.y+(e.y-A.y)*t,this.z=A.z+(e.z-A.z)*t,this}cross(A){return this.crossVectors(this,A)}crossVectors(A,e){const t=A.x,n=A.y,i=A.z,a=e.x,o=e.y,s=e.z;return this.x=n*s-i*o,this.y=i*a-t*s,this.z=t*o-n*a,this}projectOnVector(A){const e=A.lengthSq();if(e===0)return this.set(0,0,0);const t=A.dot(this)/e;return this.copy(A).multiplyScalar(t)}projectOnPlane(A){return zi.copy(this).projectOnVector(A),this.sub(zi)}reflect(A){return this.sub(zi.copy(A).multiplyScalar(2*this.dot(A)))}angleTo(A){const e=Math.sqrt(this.lengthSq()*A.lengthSq());if(e===0)return Math.PI/2;const t=this.dot(A)/e;return Math.acos(ve(t,-1,1))}distanceTo(A){return Math.sqrt(this.distanceToSquared(A))}distanceToSquared(A){const e=this.x-A.x,t=this.y-A.y,n=this.z-A.z;return e*e+t*t+n*n}manhattanDistanceTo(A){return Math.abs(this.x-A.x)+Math.abs(this.y-A.y)+Math.abs(this.z-A.z)}setFromSpherical(A){return this.setFromSphericalCoords(A.radius,A.phi,A.theta)}setFromSphericalCoords(A,e,t){const n=Math.sin(e)*A;return this.x=n*Math.sin(t),this.y=Math.cos(e)*A,this.z=n*Math.cos(t),this}setFromCylindrical(A){return this.setFromCylindricalCoords(A.radius,A.theta,A.y)}setFromCylindricalCoords(A,e,t){return this.x=A*Math.sin(e),this.y=t,this.z=A*Math.cos(e),this}setFromMatrixPosition(A){const e=A.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(A){const e=this.setFromMatrixColumn(A,0).length(),t=this.setFromMatrixColumn(A,1).length(),n=this.setFromMatrixColumn(A,2).length();return this.x=e,this.y=t,this.z=n,this}setFromMatrixColumn(A,e){return this.fromArray(A.elements,4*e)}setFromMatrix3Column(A,e){return this.fromArray(A.elements,3*e)}setFromEuler(A){return this.x=A._x,this.y=A._y,this.z=A._z,this}setFromColor(A){return this.x=A.r,this.y=A.g,this.z=A.b,this}equals(A){return A.x===this.x&&A.y===this.y&&A.z===this.z}fromArray(A,e=0){return this.x=A[e],this.y=A[e+1],this.z=A[e+2],this}toArray(A=[],e=0){return A[e]=this.x,A[e+1]=this.y,A[e+2]=this.z,A}fromBufferAttribute(A,e){return this.x=A.getX(e),this.y=A.getY(e),this.z=A.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const A=2*(Math.random()-.5),e=Math.random()*Math.PI*2,t=Math.sqrt(1-A**2);return this.x=t*Math.cos(e),this.y=t*Math.sin(e),this.z=A,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const zi=new Q,Os=new jr;class _t{constructor(A=new Q(1/0,1/0,1/0),e=new Q(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=A,this.max=e}set(A,e){return this.min.copy(A),this.max.copy(e),this}setFromArray(A){this.makeEmpty();for(let e=0,t=A.length;e<t;e+=3)this.expandByPoint(Pe.fromArray(A,e));return this}setFromBufferAttribute(A){this.makeEmpty();for(let e=0,t=A.count;e<t;e++)this.expandByPoint(Pe.fromBufferAttribute(A,e));return this}setFromPoints(A){this.makeEmpty();for(let e=0,t=A.length;e<t;e++)this.expandByPoint(A[e]);return this}setFromCenterAndSize(A,e){const t=Pe.copy(e).multiplyScalar(.5);return this.min.copy(A).sub(t),this.max.copy(A).add(t),this}setFromObject(A,e=!1){return this.makeEmpty(),this.expandByObject(A,e)}clone(){return new this.constructor().copy(this)}copy(A){return this.min.copy(A.min),this.max.copy(A.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(A){return this.isEmpty()?A.set(0,0,0):A.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(A){return this.isEmpty()?A.set(0,0,0):A.subVectors(this.max,this.min)}expandByPoint(A){return this.min.min(A),this.max.max(A),this}expandByVector(A){return this.min.sub(A),this.max.add(A),this}expandByScalar(A){return this.min.addScalar(-A),this.max.addScalar(A),this}expandByObject(A,e=!1){A.updateWorldMatrix(!1,!1);const t=A.geometry;if(t!==void 0){const i=t.getAttribute("position");if(e===!0&&i!==void 0&&A.isInstancedMesh!==!0)for(let a=0,o=i.count;a<o;a++)A.isMesh===!0?A.getVertexPosition(a,Pe):Pe.fromBufferAttribute(i,a),Pe.applyMatrix4(A.matrixWorld),this.expandByPoint(Pe);else A.boundingBox!==void 0?(A.boundingBox===null&&A.computeBoundingBox(),un.copy(A.boundingBox)):(t.boundingBox===null&&t.computeBoundingBox(),un.copy(t.boundingBox)),un.applyMatrix4(A.matrixWorld),this.union(un)}const n=A.children;for(let i=0,a=n.length;i<a;i++)this.expandByObject(n[i],e);return this}containsPoint(A){return!(A.x<this.min.x||A.x>this.max.x||A.y<this.min.y||A.y>this.max.y||A.z<this.min.z||A.z>this.max.z)}containsBox(A){return this.min.x<=A.min.x&&A.max.x<=this.max.x&&this.min.y<=A.min.y&&A.max.y<=this.max.y&&this.min.z<=A.min.z&&A.max.z<=this.max.z}getParameter(A,e){return e.set((A.x-this.min.x)/(this.max.x-this.min.x),(A.y-this.min.y)/(this.max.y-this.min.y),(A.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(A){return!(A.max.x<this.min.x||A.min.x>this.max.x||A.max.y<this.min.y||A.min.y>this.max.y||A.max.z<this.min.z||A.min.z>this.max.z)}intersectsSphere(A){return this.clampPoint(A.center,Pe),Pe.distanceToSquared(A.center)<=A.radius*A.radius}intersectsPlane(A){let e,t;return A.normal.x>0?(e=A.normal.x*this.min.x,t=A.normal.x*this.max.x):(e=A.normal.x*this.max.x,t=A.normal.x*this.min.x),A.normal.y>0?(e+=A.normal.y*this.min.y,t+=A.normal.y*this.max.y):(e+=A.normal.y*this.max.y,t+=A.normal.y*this.min.y),A.normal.z>0?(e+=A.normal.z*this.min.z,t+=A.normal.z*this.max.z):(e+=A.normal.z*this.max.z,t+=A.normal.z*this.min.z),e<=-A.constant&&t>=-A.constant}intersectsTriangle(A){if(this.isEmpty())return!1;this.getCenter(xr),hn.subVectors(this.max,xr),zt.subVectors(A.a,xr),Wt.subVectors(A.b,xr),Xt.subVectors(A.c,xr),st.subVectors(Wt,zt),ot.subVectors(Xt,Wt),Mt.subVectors(zt,Xt);let e=[0,-st.z,st.y,0,-ot.z,ot.y,0,-Mt.z,Mt.y,st.z,0,-st.x,ot.z,0,-ot.x,Mt.z,0,-Mt.x,-st.y,st.x,0,-ot.y,ot.x,0,-Mt.y,Mt.x,0];return!!Wi(e,zt,Wt,Xt,hn)&&(e=[1,0,0,0,1,0,0,0,1],!!Wi(e,zt,Wt,Xt,hn)&&(dn.crossVectors(st,ot),e=[dn.x,dn.y,dn.z],Wi(e,zt,Wt,Xt,hn)))}clampPoint(A,e){return e.copy(A).clamp(this.min,this.max)}distanceToPoint(A){return this.clampPoint(A,Pe).distanceTo(A)}getBoundingSphere(A){return this.isEmpty()?A.makeEmpty():(this.getCenter(A.center),A.radius=.5*this.getSize(Pe).length()),A}intersect(A){return this.min.max(A.min),this.max.min(A.max),this.isEmpty()&&this.makeEmpty(),this}union(A){return this.min.min(A.min),this.max.max(A.max),this}applyMatrix4(A){return this.isEmpty()||(qe[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(A),qe[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(A),qe[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(A),qe[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(A),qe[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(A),qe[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(A),qe[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(A),qe[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(A),this.setFromPoints(qe)),this}translate(A){return this.min.add(A),this.max.add(A),this}equals(A){return A.min.equals(this.min)&&A.max.equals(this.max)}}const qe=[new Q,new Q,new Q,new Q,new Q,new Q,new Q,new Q],Pe=new Q,un=new _t,zt=new Q,Wt=new Q,Xt=new Q,st=new Q,ot=new Q,Mt=new Q,xr=new Q,hn=new Q,dn=new Q,St=new Q;function Wi(r,A,e,t,n){for(let i=0,a=r.length-3;i<=a;i+=3){St.fromArray(r,i);const o=n.x*Math.abs(St.x)+n.y*Math.abs(St.y)+n.z*Math.abs(St.z),s=A.dot(St),l=e.dot(St),c=t.dot(St);if(Math.max(-Math.max(s,l,c),Math.min(s,l,c))>o)return!1}return!0}const du=new _t,yr=new Q,Xi=new Q;class Ct{constructor(A=new Q,e=-1){this.isSphere=!0,this.center=A,this.radius=e}set(A,e){return this.center.copy(A),this.radius=e,this}setFromPoints(A,e){const t=this.center;e!==void 0?t.copy(e):du.setFromPoints(A).getCenter(t);let n=0;for(let i=0,a=A.length;i<a;i++)n=Math.max(n,t.distanceToSquared(A[i]));return this.radius=Math.sqrt(n),this}copy(A){return this.center.copy(A.center),this.radius=A.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(A){return A.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(A){return A.distanceTo(this.center)-this.radius}intersectsSphere(A){const e=this.radius+A.radius;return A.center.distanceToSquared(this.center)<=e*e}intersectsBox(A){return A.intersectsSphere(this)}intersectsPlane(A){return Math.abs(A.distanceToPoint(this.center))<=this.radius}clampPoint(A,e){const t=this.center.distanceToSquared(A);return e.copy(A),t>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(A){return this.isEmpty()?(A.makeEmpty(),A):(A.set(this.center,this.center),A.expandByScalar(this.radius),A)}applyMatrix4(A){return this.center.applyMatrix4(A),this.radius=this.radius*A.getMaxScaleOnAxis(),this}translate(A){return this.center.add(A),this}expandByPoint(A){if(this.isEmpty())return this.center.copy(A),this.radius=0,this;yr.subVectors(A,this.center);const e=yr.lengthSq();if(e>this.radius*this.radius){const t=Math.sqrt(e),n=.5*(t-this.radius);this.center.addScaledVector(yr,n/t),this.radius+=n}return this}union(A){return A.isEmpty()?this:this.isEmpty()?(this.copy(A),this):(this.center.equals(A.center)===!0?this.radius=Math.max(this.radius,A.radius):(Xi.subVectors(A.center,this.center).setLength(A.radius),this.expandByPoint(yr.copy(A.center).add(Xi)),this.expandByPoint(yr.copy(A.center).sub(Xi))),this)}equals(A){return A.center.equals(this.center)&&A.radius===this.radius}clone(){return new this.constructor().copy(this)}}const je=new Q,Yi=new Q,fn=new Q,lt=new Q,Ji=new Q,pn=new Q,Zi=new Q;class wi{constructor(A=new Q,e=new Q(0,0,-1)){this.origin=A,this.direction=e}set(A,e){return this.origin.copy(A),this.direction.copy(e),this}copy(A){return this.origin.copy(A.origin),this.direction.copy(A.direction),this}at(A,e){return e.copy(this.origin).addScaledVector(this.direction,A)}lookAt(A){return this.direction.copy(A).sub(this.origin).normalize(),this}recast(A){return this.origin.copy(this.at(A,je)),this}closestPointToPoint(A,e){e.subVectors(A,this.origin);const t=e.dot(this.direction);return t<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,t)}distanceToPoint(A){return Math.sqrt(this.distanceSqToPoint(A))}distanceSqToPoint(A){const e=je.subVectors(A,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(A):(je.copy(this.origin).addScaledVector(this.direction,e),je.distanceToSquared(A))}distanceSqToSegment(A,e,t,n){Yi.copy(A).add(e).multiplyScalar(.5),fn.copy(e).sub(A).normalize(),lt.copy(this.origin).sub(Yi);const i=.5*A.distanceTo(e),a=-this.direction.dot(fn),o=lt.dot(this.direction),s=-lt.dot(fn),l=lt.lengthSq(),c=Math.abs(1-a*a);let u,h,d,g;if(c>0)if(u=a*s-o,h=a*o-s,g=i*c,u>=0)if(h>=-g)if(h<=g){const m=1/c;u*=m,h*=m,d=u*(u+a*h+2*o)+h*(a*u+h+2*s)+l}else h=i,u=Math.max(0,-(a*h+o)),d=-u*u+h*(h+2*s)+l;else h=-i,u=Math.max(0,-(a*h+o)),d=-u*u+h*(h+2*s)+l;else h<=-g?(u=Math.max(0,-(-a*i+o)),h=u>0?-i:Math.min(Math.max(-i,-s),i),d=-u*u+h*(h+2*s)+l):h<=g?(u=0,h=Math.min(Math.max(-i,-s),i),d=h*(h+2*s)+l):(u=Math.max(0,-(a*i+o)),h=u>0?i:Math.min(Math.max(-i,-s),i),d=-u*u+h*(h+2*s)+l);else h=a>0?-i:i,u=Math.max(0,-(a*h+o)),d=-u*u+h*(h+2*s)+l;return t&&t.copy(this.origin).addScaledVector(this.direction,u),n&&n.copy(Yi).addScaledVector(fn,h),d}intersectSphere(A,e){je.subVectors(A.center,this.origin);const t=je.dot(this.direction),n=je.dot(je)-t*t,i=A.radius*A.radius;if(n>i)return null;const a=Math.sqrt(i-n),o=t-a,s=t+a;return s<0?null:o<0?this.at(s,e):this.at(o,e)}intersectsSphere(A){return this.distanceSqToPoint(A.center)<=A.radius*A.radius}distanceToPlane(A){const e=A.normal.dot(this.direction);if(e===0)return A.distanceToPoint(this.origin)===0?0:null;const t=-(this.origin.dot(A.normal)+A.constant)/e;return t>=0?t:null}intersectPlane(A,e){const t=this.distanceToPlane(A);return t===null?null:this.at(t,e)}intersectsPlane(A){const e=A.distanceToPoint(this.origin);return e===0?!0:A.normal.dot(this.direction)*e<0}intersectBox(A,e){let t,n,i,a,o,s;const l=1/this.direction.x,c=1/this.direction.y,u=1/this.direction.z,h=this.origin;return l>=0?(t=(A.min.x-h.x)*l,n=(A.max.x-h.x)*l):(t=(A.max.x-h.x)*l,n=(A.min.x-h.x)*l),c>=0?(i=(A.min.y-h.y)*c,a=(A.max.y-h.y)*c):(i=(A.max.y-h.y)*c,a=(A.min.y-h.y)*c),t>a||i>n?null:((i>t||isNaN(t))&&(t=i),(a<n||isNaN(n))&&(n=a),u>=0?(o=(A.min.z-h.z)*u,s=(A.max.z-h.z)*u):(o=(A.max.z-h.z)*u,s=(A.min.z-h.z)*u),t>s||o>n?null:((o>t||t!=t)&&(t=o),(s<n||n!=n)&&(n=s),n<0?null:this.at(t>=0?t:n,e)))}intersectsBox(A){return this.intersectBox(A,je)!==null}intersectTriangle(A,e,t,n,i){Ji.subVectors(e,A),pn.subVectors(t,A),Zi.crossVectors(Ji,pn);let a,o=this.direction.dot(Zi);if(o>0){if(n)return null;a=1}else{if(!(o<0))return null;a=-1,o=-o}lt.subVectors(this.origin,A);const s=a*this.direction.dot(pn.crossVectors(lt,pn));if(s<0)return null;const l=a*this.direction.dot(Ji.cross(lt));if(l<0||s+l>o)return null;const c=-a*lt.dot(Zi);return c<0?null:this.at(c/o,i)}applyMatrix4(A){return this.origin.applyMatrix4(A),this.direction.transformDirection(A),this}equals(A){return A.origin.equals(this.origin)&&A.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class CA{constructor(A,e,t,n,i,a,o,s,l,c,u,h,d,g,m,f){CA.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],A!==void 0&&this.set(A,e,t,n,i,a,o,s,l,c,u,h,d,g,m,f)}set(A,e,t,n,i,a,o,s,l,c,u,h,d,g,m,f){const v=this.elements;return v[0]=A,v[4]=e,v[8]=t,v[12]=n,v[1]=i,v[5]=a,v[9]=o,v[13]=s,v[2]=l,v[6]=c,v[10]=u,v[14]=h,v[3]=d,v[7]=g,v[11]=m,v[15]=f,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new CA().fromArray(this.elements)}copy(A){const e=this.elements,t=A.elements;return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],this}copyPosition(A){const e=this.elements,t=A.elements;return e[12]=t[12],e[13]=t[13],e[14]=t[14],this}setFromMatrix3(A){const e=A.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(A,e,t){return A.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),t.setFromMatrixColumn(this,2),this}makeBasis(A,e,t){return this.set(A.x,e.x,t.x,0,A.y,e.y,t.y,0,A.z,e.z,t.z,0,0,0,0,1),this}extractRotation(A){const e=this.elements,t=A.elements,n=1/Yt.setFromMatrixColumn(A,0).length(),i=1/Yt.setFromMatrixColumn(A,1).length(),a=1/Yt.setFromMatrixColumn(A,2).length();return e[0]=t[0]*n,e[1]=t[1]*n,e[2]=t[2]*n,e[3]=0,e[4]=t[4]*i,e[5]=t[5]*i,e[6]=t[6]*i,e[7]=0,e[8]=t[8]*a,e[9]=t[9]*a,e[10]=t[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(A){const e=this.elements,t=A.x,n=A.y,i=A.z,a=Math.cos(t),o=Math.sin(t),s=Math.cos(n),l=Math.sin(n),c=Math.cos(i),u=Math.sin(i);if(A.order==="XYZ"){const h=a*c,d=a*u,g=o*c,m=o*u;e[0]=s*c,e[4]=-s*u,e[8]=l,e[1]=d+g*l,e[5]=h-m*l,e[9]=-o*s,e[2]=m-h*l,e[6]=g+d*l,e[10]=a*s}else if(A.order==="YXZ"){const h=s*c,d=s*u,g=l*c,m=l*u;e[0]=h+m*o,e[4]=g*o-d,e[8]=a*l,e[1]=a*u,e[5]=a*c,e[9]=-o,e[2]=d*o-g,e[6]=m+h*o,e[10]=a*s}else if(A.order==="ZXY"){const h=s*c,d=s*u,g=l*c,m=l*u;e[0]=h-m*o,e[4]=-a*u,e[8]=g+d*o,e[1]=d+g*o,e[5]=a*c,e[9]=m-h*o,e[2]=-a*l,e[6]=o,e[10]=a*s}else if(A.order==="ZYX"){const h=a*c,d=a*u,g=o*c,m=o*u;e[0]=s*c,e[4]=g*l-d,e[8]=h*l+m,e[1]=s*u,e[5]=m*l+h,e[9]=d*l-g,e[2]=-l,e[6]=o*s,e[10]=a*s}else if(A.order==="YZX"){const h=a*s,d=a*l,g=o*s,m=o*l;e[0]=s*c,e[4]=m-h*u,e[8]=g*u+d,e[1]=u,e[5]=a*c,e[9]=-o*c,e[2]=-l*c,e[6]=d*u+g,e[10]=h-m*u}else if(A.order==="XZY"){const h=a*s,d=a*l,g=o*s,m=o*l;e[0]=s*c,e[4]=-u,e[8]=l*c,e[1]=h*u+m,e[5]=a*c,e[9]=d*u-g,e[2]=g*u-d,e[6]=o*c,e[10]=m*u+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(A){return this.compose(fu,A,pu)}lookAt(A,e,t){const n=this.elements;return Ce.subVectors(A,e),Ce.lengthSq()===0&&(Ce.z=1),Ce.normalize(),ct.crossVectors(t,Ce),ct.lengthSq()===0&&(Math.abs(t.z)===1?Ce.x+=1e-4:Ce.z+=1e-4,Ce.normalize(),ct.crossVectors(t,Ce)),ct.normalize(),gn.crossVectors(Ce,ct),n[0]=ct.x,n[4]=gn.x,n[8]=Ce.x,n[1]=ct.y,n[5]=gn.y,n[9]=Ce.y,n[2]=ct.z,n[6]=gn.z,n[10]=Ce.z,this}multiply(A){return this.multiplyMatrices(this,A)}premultiply(A){return this.multiplyMatrices(A,this)}multiplyMatrices(A,e){const t=A.elements,n=e.elements,i=this.elements,a=t[0],o=t[4],s=t[8],l=t[12],c=t[1],u=t[5],h=t[9],d=t[13],g=t[2],m=t[6],f=t[10],v=t[14],p=t[3],B=t[7],T=t[11],S=t[15],E=n[0],x=n[4],I=n[8],M=n[12],L=n[1],j=n[5],y=n[9],H=n[13],D=n[2],AA=n[6],iA=n[10],k=n[14],G=n[3],W=n[7],R=n[11],V=n[15];return i[0]=a*E+o*L+s*D+l*G,i[4]=a*x+o*j+s*AA+l*W,i[8]=a*I+o*y+s*iA+l*R,i[12]=a*M+o*H+s*k+l*V,i[1]=c*E+u*L+h*D+d*G,i[5]=c*x+u*j+h*AA+d*W,i[9]=c*I+u*y+h*iA+d*R,i[13]=c*M+u*H+h*k+d*V,i[2]=g*E+m*L+f*D+v*G,i[6]=g*x+m*j+f*AA+v*W,i[10]=g*I+m*y+f*iA+v*R,i[14]=g*M+m*H+f*k+v*V,i[3]=p*E+B*L+T*D+S*G,i[7]=p*x+B*j+T*AA+S*W,i[11]=p*I+B*y+T*iA+S*R,i[15]=p*M+B*H+T*k+S*V,this}multiplyScalar(A){const e=this.elements;return e[0]*=A,e[4]*=A,e[8]*=A,e[12]*=A,e[1]*=A,e[5]*=A,e[9]*=A,e[13]*=A,e[2]*=A,e[6]*=A,e[10]*=A,e[14]*=A,e[3]*=A,e[7]*=A,e[11]*=A,e[15]*=A,this}determinant(){const A=this.elements,e=A[0],t=A[4],n=A[8],i=A[12],a=A[1],o=A[5],s=A[9],l=A[13],c=A[2],u=A[6],h=A[10],d=A[14];return A[3]*(+i*s*u-n*l*u-i*o*h+t*l*h+n*o*d-t*s*d)+A[7]*(+e*s*d-e*l*h+i*a*h-n*a*d+n*l*c-i*s*c)+A[11]*(+e*l*u-e*o*d-i*a*u+t*a*d+i*o*c-t*l*c)+A[15]*(-n*o*c-e*s*u+e*o*h+n*a*u-t*a*h+t*s*c)}transpose(){const A=this.elements;let e;return e=A[1],A[1]=A[4],A[4]=e,e=A[2],A[2]=A[8],A[8]=e,e=A[6],A[6]=A[9],A[9]=e,e=A[3],A[3]=A[12],A[12]=e,e=A[7],A[7]=A[13],A[13]=e,e=A[11],A[11]=A[14],A[14]=e,this}setPosition(A,e,t){const n=this.elements;return A.isVector3?(n[12]=A.x,n[13]=A.y,n[14]=A.z):(n[12]=A,n[13]=e,n[14]=t),this}invert(){const A=this.elements,e=A[0],t=A[1],n=A[2],i=A[3],a=A[4],o=A[5],s=A[6],l=A[7],c=A[8],u=A[9],h=A[10],d=A[11],g=A[12],m=A[13],f=A[14],v=A[15],p=u*f*l-m*h*l+m*s*d-o*f*d-u*s*v+o*h*v,B=g*h*l-c*f*l-g*s*d+a*f*d+c*s*v-a*h*v,T=c*m*l-g*u*l+g*o*d-a*m*d-c*o*v+a*u*v,S=g*u*s-c*m*s-g*o*h+a*m*h+c*o*f-a*u*f,E=e*p+t*B+n*T+i*S;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const x=1/E;return A[0]=p*x,A[1]=(m*h*i-u*f*i-m*n*d+t*f*d+u*n*v-t*h*v)*x,A[2]=(o*f*i-m*s*i+m*n*l-t*f*l-o*n*v+t*s*v)*x,A[3]=(u*s*i-o*h*i-u*n*l+t*h*l+o*n*d-t*s*d)*x,A[4]=B*x,A[5]=(c*f*i-g*h*i+g*n*d-e*f*d-c*n*v+e*h*v)*x,A[6]=(g*s*i-a*f*i-g*n*l+e*f*l+a*n*v-e*s*v)*x,A[7]=(a*h*i-c*s*i+c*n*l-e*h*l-a*n*d+e*s*d)*x,A[8]=T*x,A[9]=(g*u*i-c*m*i-g*t*d+e*m*d+c*t*v-e*u*v)*x,A[10]=(a*m*i-g*o*i+g*t*l-e*m*l-a*t*v+e*o*v)*x,A[11]=(c*o*i-a*u*i-c*t*l+e*u*l+a*t*d-e*o*d)*x,A[12]=S*x,A[13]=(c*m*n-g*u*n+g*t*h-e*m*h-c*t*f+e*u*f)*x,A[14]=(g*o*n-a*m*n-g*t*s+e*m*s+a*t*f-e*o*f)*x,A[15]=(a*u*n-c*o*n+c*t*s-e*u*s-a*t*h+e*o*h)*x,this}scale(A){const e=this.elements,t=A.x,n=A.y,i=A.z;return e[0]*=t,e[4]*=n,e[8]*=i,e[1]*=t,e[5]*=n,e[9]*=i,e[2]*=t,e[6]*=n,e[10]*=i,e[3]*=t,e[7]*=n,e[11]*=i,this}getMaxScaleOnAxis(){const A=this.elements,e=A[0]*A[0]+A[1]*A[1]+A[2]*A[2],t=A[4]*A[4]+A[5]*A[5]+A[6]*A[6],n=A[8]*A[8]+A[9]*A[9]+A[10]*A[10];return Math.sqrt(Math.max(e,t,n))}makeTranslation(A,e,t){return A.isVector3?this.set(1,0,0,A.x,0,1,0,A.y,0,0,1,A.z,0,0,0,1):this.set(1,0,0,A,0,1,0,e,0,0,1,t,0,0,0,1),this}makeRotationX(A){const e=Math.cos(A),t=Math.sin(A);return this.set(1,0,0,0,0,e,-t,0,0,t,e,0,0,0,0,1),this}makeRotationY(A){const e=Math.cos(A),t=Math.sin(A);return this.set(e,0,t,0,0,1,0,0,-t,0,e,0,0,0,0,1),this}makeRotationZ(A){const e=Math.cos(A),t=Math.sin(A);return this.set(e,-t,0,0,t,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(A,e){const t=Math.cos(e),n=Math.sin(e),i=1-t,a=A.x,o=A.y,s=A.z,l=i*a,c=i*o;return this.set(l*a+t,l*o-n*s,l*s+n*o,0,l*o+n*s,c*o+t,c*s-n*a,0,l*s-n*o,c*s+n*a,i*s*s+t,0,0,0,0,1),this}makeScale(A,e,t){return this.set(A,0,0,0,0,e,0,0,0,0,t,0,0,0,0,1),this}makeShear(A,e,t,n,i,a){return this.set(1,t,i,0,A,1,a,0,e,n,1,0,0,0,0,1),this}compose(A,e,t){const n=this.elements,i=e._x,a=e._y,o=e._z,s=e._w,l=i+i,c=a+a,u=o+o,h=i*l,d=i*c,g=i*u,m=a*c,f=a*u,v=o*u,p=s*l,B=s*c,T=s*u,S=t.x,E=t.y,x=t.z;return n[0]=(1-(m+v))*S,n[1]=(d+T)*S,n[2]=(g-B)*S,n[3]=0,n[4]=(d-T)*E,n[5]=(1-(h+v))*E,n[6]=(f+p)*E,n[7]=0,n[8]=(g+B)*x,n[9]=(f-p)*x,n[10]=(1-(h+m))*x,n[11]=0,n[12]=A.x,n[13]=A.y,n[14]=A.z,n[15]=1,this}decompose(A,e,t){const n=this.elements;let i=Yt.set(n[0],n[1],n[2]).length();const a=Yt.set(n[4],n[5],n[6]).length(),o=Yt.set(n[8],n[9],n[10]).length();this.determinant()<0&&(i=-i),A.x=n[12],A.y=n[13],A.z=n[14],Oe.copy(this);const s=1/i,l=1/a,c=1/o;return Oe.elements[0]*=s,Oe.elements[1]*=s,Oe.elements[2]*=s,Oe.elements[4]*=l,Oe.elements[5]*=l,Oe.elements[6]*=l,Oe.elements[8]*=c,Oe.elements[9]*=c,Oe.elements[10]*=c,e.setFromRotationMatrix(Oe),t.x=i,t.y=a,t.z=o,this}makePerspective(A,e,t,n,i,a,o=2e3){const s=this.elements,l=2*i/(e-A),c=2*i/(t-n),u=(e+A)/(e-A),h=(t+n)/(t-n);let d,g;if(o===2e3)d=-(a+i)/(a-i),g=-2*a*i/(a-i);else{if(o!==2001)throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);d=-a/(a-i),g=-a*i/(a-i)}return s[0]=l,s[4]=0,s[8]=u,s[12]=0,s[1]=0,s[5]=c,s[9]=h,s[13]=0,s[2]=0,s[6]=0,s[10]=d,s[14]=g,s[3]=0,s[7]=0,s[11]=-1,s[15]=0,this}makeOrthographic(A,e,t,n,i,a,o=2e3){const s=this.elements,l=1/(e-A),c=1/(t-n),u=1/(a-i),h=(e+A)*l,d=(t+n)*c;let g,m;if(o===2e3)g=(a+i)*u,m=-2*u;else{if(o!==2001)throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);g=i*u,m=-1*u}return s[0]=2*l,s[4]=0,s[8]=0,s[12]=-h,s[1]=0,s[5]=2*c,s[9]=0,s[13]=-d,s[2]=0,s[6]=0,s[10]=m,s[14]=-g,s[3]=0,s[7]=0,s[11]=0,s[15]=1,this}equals(A){const e=this.elements,t=A.elements;for(let n=0;n<16;n++)if(e[n]!==t[n])return!1;return!0}fromArray(A,e=0){for(let t=0;t<16;t++)this.elements[t]=A[t+e];return this}toArray(A=[],e=0){const t=this.elements;return A[e]=t[0],A[e+1]=t[1],A[e+2]=t[2],A[e+3]=t[3],A[e+4]=t[4],A[e+5]=t[5],A[e+6]=t[6],A[e+7]=t[7],A[e+8]=t[8],A[e+9]=t[9],A[e+10]=t[10],A[e+11]=t[11],A[e+12]=t[12],A[e+13]=t[13],A[e+14]=t[14],A[e+15]=t[15],A}}const Yt=new Q,Oe=new CA,fu=new Q(0,0,0),pu=new Q(1,1,1),ct=new Q,gn=new Q,Ce=new Q,Ns=new CA,Gs=new jr;class _i{constructor(A=0,e=0,t=0,n=_i.DEFAULT_ORDER){this.isEuler=!0,this._x=A,this._y=e,this._z=t,this._order=n}get x(){return this._x}set x(A){this._x=A,this._onChangeCallback()}get y(){return this._y}set y(A){this._y=A,this._onChangeCallback()}get z(){return this._z}set z(A){this._z=A,this._onChangeCallback()}get order(){return this._order}set order(A){this._order=A,this._onChangeCallback()}set(A,e,t,n=this._order){return this._x=A,this._y=e,this._z=t,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(A){return this._x=A._x,this._y=A._y,this._z=A._z,this._order=A._order,this._onChangeCallback(),this}setFromRotationMatrix(A,e=this._order,t=!0){const n=A.elements,i=n[0],a=n[4],o=n[8],s=n[1],l=n[5],c=n[9],u=n[2],h=n[6],d=n[10];switch(e){case"XYZ":this._y=Math.asin(ve(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-c,d),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-ve(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(s,l)):(this._y=Math.atan2(-u,i),this._z=0);break;case"ZXY":this._x=Math.asin(ve(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(s,i));break;case"ZYX":this._y=Math.asin(-ve(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(ve(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-c,l),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-ve(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-c,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,t===!0&&this._onChangeCallback(),this}setFromQuaternion(A,e,t){return Ns.makeRotationFromQuaternion(A),this.setFromRotationMatrix(Ns,e,t)}setFromVector3(A,e=this._order){return this.set(A.x,A.y,A.z,e)}reorder(A){return Gs.setFromEuler(this),this.setFromQuaternion(Gs,A)}equals(A){return A._x===this._x&&A._y===this._y&&A._z===this._z&&A._order===this._order}fromArray(A){return this._x=A[0],this._y=A[1],this._z=A[2],A[3]!==void 0&&(this._order=A[3]),this._onChangeCallback(),this}toArray(A=[],e=0){return A[e]=this._x,A[e+1]=this._y,A[e+2]=this._z,A[e+3]=this._order,A}_onChange(A){return this._onChangeCallback=A,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}_i.DEFAULT_ORDER="XYZ";class Ql{constructor(){this.mask=1}set(A){this.mask=(1<<A|0)>>>0}enable(A){this.mask|=1<<A|0}enableAll(){this.mask=-1}toggle(A){this.mask^=1<<A|0}disable(A){this.mask&=~(1<<A|0)}disableAll(){this.mask=0}test(A){return(this.mask&A.mask)!=0}isEnabled(A){return(this.mask&(1<<A|0))!=0}}let gu=0;const Vs=new Q,Jt=new jr,$e=new CA,mn=new Q,Mr=new Q,mu=new Q,Bu=new jr,Ks=new Q(1,0,0),ks=new Q(0,1,0),zs=new Q(0,0,1),vu={type:"added"},wu={type:"removed"};class ue extends Br{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:gu++}),this.uuid=qr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ue.DEFAULT_UP.clone();const A=new Q,e=new _i,t=new jr,n=new Q(1,1,1);e._onChange((function(){t.setFromEuler(e,!1)})),t._onChange((function(){e.setFromQuaternion(t,void 0,!1)})),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:A},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:t},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new CA},normalMatrix:{value:new UA}}),this.matrix=new CA,this.matrixWorld=new CA,this.matrixAutoUpdate=ue.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ue.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ql,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(A){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(A),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(A){return this.quaternion.premultiply(A),this}setRotationFromAxisAngle(A,e){this.quaternion.setFromAxisAngle(A,e)}setRotationFromEuler(A){this.quaternion.setFromEuler(A,!0)}setRotationFromMatrix(A){this.quaternion.setFromRotationMatrix(A)}setRotationFromQuaternion(A){this.quaternion.copy(A)}rotateOnAxis(A,e){return Jt.setFromAxisAngle(A,e),this.quaternion.multiply(Jt),this}rotateOnWorldAxis(A,e){return Jt.setFromAxisAngle(A,e),this.quaternion.premultiply(Jt),this}rotateX(A){return this.rotateOnAxis(Ks,A)}rotateY(A){return this.rotateOnAxis(ks,A)}rotateZ(A){return this.rotateOnAxis(zs,A)}translateOnAxis(A,e){return Vs.copy(A).applyQuaternion(this.quaternion),this.position.add(Vs.multiplyScalar(e)),this}translateX(A){return this.translateOnAxis(Ks,A)}translateY(A){return this.translateOnAxis(ks,A)}translateZ(A){return this.translateOnAxis(zs,A)}localToWorld(A){return this.updateWorldMatrix(!0,!1),A.applyMatrix4(this.matrixWorld)}worldToLocal(A){return this.updateWorldMatrix(!0,!1),A.applyMatrix4($e.copy(this.matrixWorld).invert())}lookAt(A,e,t){A.isVector3?mn.copy(A):mn.set(A,e,t);const n=this.parent;this.updateWorldMatrix(!0,!1),Mr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$e.lookAt(Mr,mn,this.up):$e.lookAt(mn,Mr,this.up),this.quaternion.setFromRotationMatrix($e),n&&($e.extractRotation(n.matrixWorld),Jt.setFromRotationMatrix($e),this.quaternion.premultiply(Jt.invert()))}add(A){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return A===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",A),this):(A&&A.isObject3D?(A.parent!==null&&A.parent.remove(A),A.parent=this,this.children.push(A),A.dispatchEvent(vu)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",A),this)}remove(A){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.remove(arguments[t]);return this}const e=this.children.indexOf(A);return e!==-1&&(A.parent=null,this.children.splice(e,1),A.dispatchEvent(wu)),this}removeFromParent(){const A=this.parent;return A!==null&&A.remove(this),this}clear(){return this.remove(...this.children)}attach(A){return this.updateWorldMatrix(!0,!1),$e.copy(this.matrixWorld).invert(),A.parent!==null&&(A.parent.updateWorldMatrix(!0,!1),$e.multiply(A.parent.matrixWorld)),A.applyMatrix4($e),this.add(A),A.updateWorldMatrix(!1,!0),this}getObjectById(A){return this.getObjectByProperty("id",A)}getObjectByName(A){return this.getObjectByProperty("name",A)}getObjectByProperty(A,e){if(this[A]===e)return this;for(let t=0,n=this.children.length;t<n;t++){const i=this.children[t].getObjectByProperty(A,e);if(i!==void 0)return i}}getObjectsByProperty(A,e,t=[]){this[A]===e&&t.push(this);const n=this.children;for(let i=0,a=n.length;i<a;i++)n[i].getObjectsByProperty(A,e,t);return t}getWorldPosition(A){return this.updateWorldMatrix(!0,!1),A.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(A){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Mr,A,mu),A}getWorldScale(A){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Mr,Bu,A),A}getWorldDirection(A){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return A.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(A){A(this);const e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].traverse(A)}traverseVisible(A){if(this.visible===!1)return;A(this);const e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].traverseVisible(A)}traverseAncestors(A){const e=this.parent;e!==null&&(A(e),e.traverseAncestors(A))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(A){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||A)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,A=!0);const e=this.children;for(let t=0,n=e.length;t<n;t++){const i=e[t];i.matrixWorldAutoUpdate!==!0&&A!==!0||i.updateMatrixWorld(A)}}updateWorldMatrix(A,e){const t=this.parent;if(A===!0&&t!==null&&t.matrixWorldAutoUpdate===!0&&t.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),e===!0){const n=this.children;for(let i=0,a=n.length;i<a;i++){const o=n[i];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(A){const e=A===void 0||typeof A=="string",t={};e&&(A={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},t.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const n={};function i(o,s){return o[s.uuid]===void 0&&(o[s.uuid]=s.toJSON(A)),s.uuid}if(n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.visibility=this._visibility,n.active=this._active,n.bounds=this._bounds.map((o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()}))),n.maxGeometryCount=this._maxGeometryCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.geometryCount=this._geometryCount,n.matricesTexture=this._matricesTexture.toJSON(A),this.boundingSphere!==null&&(n.boundingSphere={center:n.boundingSphere.center.toArray(),radius:n.boundingSphere.radius}),this.boundingBox!==null&&(n.boundingBox={min:n.boundingBox.min.toArray(),max:n.boundingBox.max.toArray()})),this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(A).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(A).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=i(A.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const s=o.shapes;if(Array.isArray(s))for(let l=0,c=s.length;l<c;l++){const u=s[l];i(A.shapes,u)}else i(A.shapes,s)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(A.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let s=0,l=this.material.length;s<l;s++)o.push(i(A.materials,this.material[s]));n.material=o}else n.material=i(A.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(A).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){const s=this.animations[o];n.animations.push(i(A.animations,s))}}if(e){const o=a(A.geometries),s=a(A.materials),l=a(A.textures),c=a(A.images),u=a(A.shapes),h=a(A.skeletons),d=a(A.animations),g=a(A.nodes);o.length>0&&(t.geometries=o),s.length>0&&(t.materials=s),l.length>0&&(t.textures=l),c.length>0&&(t.images=c),u.length>0&&(t.shapes=u),h.length>0&&(t.skeletons=h),d.length>0&&(t.animations=d),g.length>0&&(t.nodes=g)}return t.object=n,t;function a(o){const s=[];for(const l in o){const c=o[l];delete c.metadata,s.push(c)}return s}}clone(A){return new this.constructor().copy(this,A)}copy(A,e=!0){if(this.name=A.name,this.up.copy(A.up),this.position.copy(A.position),this.rotation.order=A.rotation.order,this.quaternion.copy(A.quaternion),this.scale.copy(A.scale),this.matrix.copy(A.matrix),this.matrixWorld.copy(A.matrixWorld),this.matrixAutoUpdate=A.matrixAutoUpdate,this.matrixWorldAutoUpdate=A.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=A.matrixWorldNeedsUpdate,this.layers.mask=A.layers.mask,this.visible=A.visible,this.castShadow=A.castShadow,this.receiveShadow=A.receiveShadow,this.frustumCulled=A.frustumCulled,this.renderOrder=A.renderOrder,this.animations=A.animations.slice(),this.userData=JSON.parse(JSON.stringify(A.userData)),e===!0)for(let t=0;t<A.children.length;t++){const n=A.children[t];this.add(n.clone())}return this}}ue.DEFAULT_UP=new Q(0,1,0),ue.DEFAULT_MATRIX_AUTO_UPDATE=!0,ue.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ne=new Q,At=new Q,qi=new Q,et=new Q,Zt=new Q,qt=new Q,Ws=new Q,ji=new Q,$i=new Q,Aa=new Q;let Bn=!1;class Te{constructor(A=new Q,e=new Q,t=new Q){this.a=A,this.b=e,this.c=t}static getNormal(A,e,t,n){n.subVectors(t,e),Ne.subVectors(A,e),n.cross(Ne);const i=n.lengthSq();return i>0?n.multiplyScalar(1/Math.sqrt(i)):n.set(0,0,0)}static getBarycoord(A,e,t,n,i){Ne.subVectors(n,e),At.subVectors(t,e),qi.subVectors(A,e);const a=Ne.dot(Ne),o=Ne.dot(At),s=Ne.dot(qi),l=At.dot(At),c=At.dot(qi),u=a*l-o*o;if(u===0)return i.set(0,0,0),null;const h=1/u,d=(l*s-o*c)*h,g=(a*c-o*s)*h;return i.set(1-d-g,g,d)}static containsPoint(A,e,t,n){return this.getBarycoord(A,e,t,n,et)!==null&&et.x>=0&&et.y>=0&&et.x+et.y<=1}static getUV(A,e,t,n,i,a,o,s){return Bn===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Bn=!0),this.getInterpolation(A,e,t,n,i,a,o,s)}static getInterpolation(A,e,t,n,i,a,o,s){return this.getBarycoord(A,e,t,n,et)===null?(s.x=0,s.y=0,"z"in s&&(s.z=0),"w"in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,et.x),s.addScaledVector(a,et.y),s.addScaledVector(o,et.z),s)}static isFrontFacing(A,e,t,n){return Ne.subVectors(t,e),At.subVectors(A,e),Ne.cross(At).dot(n)<0}set(A,e,t){return this.a.copy(A),this.b.copy(e),this.c.copy(t),this}setFromPointsAndIndices(A,e,t,n){return this.a.copy(A[e]),this.b.copy(A[t]),this.c.copy(A[n]),this}setFromAttributeAndIndices(A,e,t,n){return this.a.fromBufferAttribute(A,e),this.b.fromBufferAttribute(A,t),this.c.fromBufferAttribute(A,n),this}clone(){return new this.constructor().copy(this)}copy(A){return this.a.copy(A.a),this.b.copy(A.b),this.c.copy(A.c),this}getArea(){return Ne.subVectors(this.c,this.b),At.subVectors(this.a,this.b),.5*Ne.cross(At).length()}getMidpoint(A){return A.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(A){return Te.getNormal(this.a,this.b,this.c,A)}getPlane(A){return A.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(A,e){return Te.getBarycoord(A,this.a,this.b,this.c,e)}getUV(A,e,t,n,i){return Bn===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Bn=!0),Te.getInterpolation(A,this.a,this.b,this.c,e,t,n,i)}getInterpolation(A,e,t,n,i){return Te.getInterpolation(A,this.a,this.b,this.c,e,t,n,i)}containsPoint(A){return Te.containsPoint(A,this.a,this.b,this.c)}isFrontFacing(A){return Te.isFrontFacing(this.a,this.b,this.c,A)}intersectsBox(A){return A.intersectsTriangle(this)}closestPointToPoint(A,e){const t=this.a,n=this.b,i=this.c;let a,o;Zt.subVectors(n,t),qt.subVectors(i,t),ji.subVectors(A,t);const s=Zt.dot(ji),l=qt.dot(ji);if(s<=0&&l<=0)return e.copy(t);$i.subVectors(A,n);const c=Zt.dot($i),u=qt.dot($i);if(c>=0&&u<=c)return e.copy(n);const h=s*u-c*l;if(h<=0&&s>=0&&c<=0)return a=s/(s-c),e.copy(t).addScaledVector(Zt,a);Aa.subVectors(A,i);const d=Zt.dot(Aa),g=qt.dot(Aa);if(g>=0&&d<=g)return e.copy(i);const m=d*l-s*g;if(m<=0&&l>=0&&g<=0)return o=l/(l-g),e.copy(t).addScaledVector(qt,o);const f=c*g-d*u;if(f<=0&&u-c>=0&&d-g>=0)return Ws.subVectors(i,n),o=(u-c)/(u-c+(d-g)),e.copy(n).addScaledVector(Ws,o);const v=1/(f+m+h);return a=m*v,o=h*v,e.copy(t).addScaledVector(Zt,a).addScaledVector(qt,o)}equals(A){return A.a.equals(this.a)&&A.b.equals(this.b)&&A.c.equals(this.c)}}const bl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ut={h:0,s:0,l:0},vn={h:0,s:0,l:0};function ea(r,A,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+6*(A-r)*e:e<.5?A:e<2/3?r+6*(A-r)*(2/3-e):r}class RA{constructor(A,e,t){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(A,e,t)}set(A,e,t){if(e===void 0&&t===void 0){const n=A;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(A,e,t);return this}setScalar(A){return this.r=A,this.g=A,this.b=A,this}setHex(A,e=YA){return A=Math.floor(A),this.r=(A>>16&255)/255,this.g=(A>>8&255)/255,this.b=(255&A)/255,PA.toWorkingColorSpace(this,e),this}setRGB(A,e,t,n=PA.workingColorSpace){return this.r=A,this.g=e,this.b=t,PA.toWorkingColorSpace(this,n),this}setHSL(A,e,t,n=PA.workingColorSpace){if(A=au(A,1),e=ve(e,0,1),t=ve(t,0,1),e===0)this.r=this.g=this.b=t;else{const i=t<=.5?t*(1+e):t+e-t*e,a=2*t-i;this.r=ea(a,i,A+1/3),this.g=ea(a,i,A),this.b=ea(a,i,A-1/3)}return PA.toWorkingColorSpace(this,n),this}setStyle(A,e=YA){function t(i){i!==void 0&&parseFloat(i)<1&&console.warn("THREE.Color: Alpha component of "+A+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(A)){let i;const a=n[1],o=n[2];switch(a){case"rgb":case"rgba":if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return t(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,e);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return t(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,e);break;case"hsl":case"hsla":if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return t(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+A)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(A)){const i=n[1],a=i.length;if(a===3)return this.setRGB(parseInt(i.charAt(0),16)/15,parseInt(i.charAt(1),16)/15,parseInt(i.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(i,16),e);console.warn("THREE.Color: Invalid hex color "+A)}else if(A&&A.length>0)return this.setColorName(A,e);return this}setColorName(A,e=YA){const t=bl[A.toLowerCase()];return t!==void 0?this.setHex(t,e):console.warn("THREE.Color: Unknown color "+A),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(A){return this.r=A.r,this.g=A.g,this.b=A.b,this}copySRGBToLinear(A){return this.r=fr(A.r),this.g=fr(A.g),this.b=fr(A.b),this}copyLinearToSRGB(A){return this.r=Ki(A.r),this.g=Ki(A.g),this.b=Ki(A.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(A=YA){return PA.fromWorkingColorSpace(oe.copy(this),A),65536*Math.round(ve(255*oe.r,0,255))+256*Math.round(ve(255*oe.g,0,255))+Math.round(ve(255*oe.b,0,255))}getHexString(A=YA){return("000000"+this.getHex(A).toString(16)).slice(-6)}getHSL(A,e=PA.workingColorSpace){PA.fromWorkingColorSpace(oe.copy(this),e);const t=oe.r,n=oe.g,i=oe.b,a=Math.max(t,n,i),o=Math.min(t,n,i);let s,l;const c=(o+a)/2;if(o===a)s=0,l=0;else{const u=a-o;switch(l=c<=.5?u/(a+o):u/(2-a-o),a){case t:s=(n-i)/u+(n<i?6:0);break;case n:s=(i-t)/u+2;break;case i:s=(t-n)/u+4}s/=6}return A.h=s,A.s=l,A.l=c,A}getRGB(A,e=PA.workingColorSpace){return PA.fromWorkingColorSpace(oe.copy(this),e),A.r=oe.r,A.g=oe.g,A.b=oe.b,A}getStyle(A=YA){PA.fromWorkingColorSpace(oe.copy(this),A);const e=oe.r,t=oe.g,n=oe.b;return A!==YA?`color(${A} ${e.toFixed(3)} ${t.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(255*e)},${Math.round(255*t)},${Math.round(255*n)})`}offsetHSL(A,e,t){return this.getHSL(ut),this.setHSL(ut.h+A,ut.s+e,ut.l+t)}add(A){return this.r+=A.r,this.g+=A.g,this.b+=A.b,this}addColors(A,e){return this.r=A.r+e.r,this.g=A.g+e.g,this.b=A.b+e.b,this}addScalar(A){return this.r+=A,this.g+=A,this.b+=A,this}sub(A){return this.r=Math.max(0,this.r-A.r),this.g=Math.max(0,this.g-A.g),this.b=Math.max(0,this.b-A.b),this}multiply(A){return this.r*=A.r,this.g*=A.g,this.b*=A.b,this}multiplyScalar(A){return this.r*=A,this.g*=A,this.b*=A,this}lerp(A,e){return this.r+=(A.r-this.r)*e,this.g+=(A.g-this.g)*e,this.b+=(A.b-this.b)*e,this}lerpColors(A,e,t){return this.r=A.r+(e.r-A.r)*t,this.g=A.g+(e.g-A.g)*t,this.b=A.b+(e.b-A.b)*t,this}lerpHSL(A,e){this.getHSL(ut),A.getHSL(vn);const t=Gi(ut.h,vn.h,e),n=Gi(ut.s,vn.s,e),i=Gi(ut.l,vn.l,e);return this.setHSL(t,n,i),this}setFromVector3(A){return this.r=A.x,this.g=A.y,this.b=A.z,this}applyMatrix3(A){const e=this.r,t=this.g,n=this.b,i=A.elements;return this.r=i[0]*e+i[3]*t+i[6]*n,this.g=i[1]*e+i[4]*t+i[7]*n,this.b=i[2]*e+i[5]*t+i[8]*n,this}equals(A){return A.r===this.r&&A.g===this.g&&A.b===this.b}fromArray(A,e=0){return this.r=A[e],this.g=A[e+1],this.b=A[e+2],this}toArray(A=[],e=0){return A[e]=this.r,A[e+1]=this.g,A[e+2]=this.b,A}fromBufferAttribute(A,e){return this.r=A.getX(e),this.g=A.getY(e),this.b=A.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const oe=new RA;RA.NAMES=bl;let _u=0;class $r extends Br{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_u++}),this.uuid=qr(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new RA(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(A){this._alphaTest>0!=A>0&&this.version++,this._alphaTest=A}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(A){if(A!==void 0)for(const e in A){const t=A[e];if(t===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const n=this[e];n!==void 0?n&&n.isColor?n.set(t):n&&n.isVector3&&t&&t.isVector3?n.copy(t):this[e]=t:console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`)}}toJSON(A){const e=A===void 0||typeof A=="string";e&&(A={textures:{},images:{}});const t={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};function n(i){const a=[];for(const o in i){const s=i[o];delete s.metadata,a.push(s)}return a}if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),this.color&&this.color.isColor&&(t.color=this.color.getHex()),this.roughness!==void 0&&(t.roughness=this.roughness),this.metalness!==void 0&&(t.metalness=this.metalness),this.sheen!==void 0&&(t.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(t.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(t.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(t.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(t.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(t.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(t.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(t.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(t.shininess=this.shininess),this.clearcoat!==void 0&&(t.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(t.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(t.clearcoatMap=this.clearcoatMap.toJSON(A).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(t.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(A).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(t.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(A).uuid,t.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(t.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(t.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(t.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(t.iridescenceMap=this.iridescenceMap.toJSON(A).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(t.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(A).uuid),this.anisotropy!==void 0&&(t.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(t.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(t.anisotropyMap=this.anisotropyMap.toJSON(A).uuid),this.map&&this.map.isTexture&&(t.map=this.map.toJSON(A).uuid),this.matcap&&this.matcap.isTexture&&(t.matcap=this.matcap.toJSON(A).uuid),this.alphaMap&&this.alphaMap.isTexture&&(t.alphaMap=this.alphaMap.toJSON(A).uuid),this.lightMap&&this.lightMap.isTexture&&(t.lightMap=this.lightMap.toJSON(A).uuid,t.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(t.aoMap=this.aoMap.toJSON(A).uuid,t.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(t.bumpMap=this.bumpMap.toJSON(A).uuid,t.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(t.normalMap=this.normalMap.toJSON(A).uuid,t.normalMapType=this.normalMapType,t.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(t.displacementMap=this.displacementMap.toJSON(A).uuid,t.displacementScale=this.displacementScale,t.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(t.roughnessMap=this.roughnessMap.toJSON(A).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(t.metalnessMap=this.metalnessMap.toJSON(A).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(t.emissiveMap=this.emissiveMap.toJSON(A).uuid),this.specularMap&&this.specularMap.isTexture&&(t.specularMap=this.specularMap.toJSON(A).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(t.specularIntensityMap=this.specularIntensityMap.toJSON(A).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(t.specularColorMap=this.specularColorMap.toJSON(A).uuid),this.envMap&&this.envMap.isTexture&&(t.envMap=this.envMap.toJSON(A).uuid,this.combine!==void 0&&(t.combine=this.combine)),this.envMapIntensity!==void 0&&(t.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(t.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(t.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(t.gradientMap=this.gradientMap.toJSON(A).uuid),this.transmission!==void 0&&(t.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(t.transmissionMap=this.transmissionMap.toJSON(A).uuid),this.thickness!==void 0&&(t.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(t.thicknessMap=this.thicknessMap.toJSON(A).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(t.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(t.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(t.size=this.size),this.shadowSide!==null&&(t.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(t.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(t.blending=this.blending),this.side!==0&&(t.side=this.side),this.vertexColors===!0&&(t.vertexColors=!0),this.opacity<1&&(t.opacity=this.opacity),this.transparent===!0&&(t.transparent=!0),this.blendSrc!==204&&(t.blendSrc=this.blendSrc),this.blendDst!==205&&(t.blendDst=this.blendDst),this.blendEquation!==100&&(t.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(t.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(t.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(t.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(t.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(t.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(t.depthFunc=this.depthFunc),this.depthTest===!1&&(t.depthTest=this.depthTest),this.depthWrite===!1&&(t.depthWrite=this.depthWrite),this.colorWrite===!1&&(t.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(t.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(t.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(t.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(t.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(t.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(t.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(t.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(t.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(t.rotation=this.rotation),this.polygonOffset===!0&&(t.polygonOffset=!0),this.polygonOffsetFactor!==0&&(t.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(t.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(t.linewidth=this.linewidth),this.dashSize!==void 0&&(t.dashSize=this.dashSize),this.gapSize!==void 0&&(t.gapSize=this.gapSize),this.scale!==void 0&&(t.scale=this.scale),this.dithering===!0&&(t.dithering=!0),this.alphaTest>0&&(t.alphaTest=this.alphaTest),this.alphaHash===!0&&(t.alphaHash=!0),this.alphaToCoverage===!0&&(t.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(t.premultipliedAlpha=!0),this.forceSinglePass===!0&&(t.forceSinglePass=!0),this.wireframe===!0&&(t.wireframe=!0),this.wireframeLinewidth>1&&(t.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(t.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(t.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(t.flatShading=!0),this.visible===!1&&(t.visible=!1),this.toneMapped===!1&&(t.toneMapped=!1),this.fog===!1&&(t.fog=!1),Object.keys(this.userData).length>0&&(t.userData=this.userData),e){const i=n(A.textures),a=n(A.images);i.length>0&&(t.textures=i),a.length>0&&(t.images=a)}return t}clone(){return new this.constructor().copy(this)}copy(A){this.name=A.name,this.blending=A.blending,this.side=A.side,this.vertexColors=A.vertexColors,this.opacity=A.opacity,this.transparent=A.transparent,this.blendSrc=A.blendSrc,this.blendDst=A.blendDst,this.blendEquation=A.blendEquation,this.blendSrcAlpha=A.blendSrcAlpha,this.blendDstAlpha=A.blendDstAlpha,this.blendEquationAlpha=A.blendEquationAlpha,this.blendColor.copy(A.blendColor),this.blendAlpha=A.blendAlpha,this.depthFunc=A.depthFunc,this.depthTest=A.depthTest,this.depthWrite=A.depthWrite,this.stencilWriteMask=A.stencilWriteMask,this.stencilFunc=A.stencilFunc,this.stencilRef=A.stencilRef,this.stencilFuncMask=A.stencilFuncMask,this.stencilFail=A.stencilFail,this.stencilZFail=A.stencilZFail,this.stencilZPass=A.stencilZPass,this.stencilWrite=A.stencilWrite;const e=A.clippingPlanes;let t=null;if(e!==null){const n=e.length;t=new Array(n);for(let i=0;i!==n;++i)t[i]=e[i].clone()}return this.clippingPlanes=t,this.clipIntersection=A.clipIntersection,this.clipShadows=A.clipShadows,this.shadowSide=A.shadowSide,this.colorWrite=A.colorWrite,this.precision=A.precision,this.polygonOffset=A.polygonOffset,this.polygonOffsetFactor=A.polygonOffsetFactor,this.polygonOffsetUnits=A.polygonOffsetUnits,this.dithering=A.dithering,this.alphaTest=A.alphaTest,this.alphaHash=A.alphaHash,this.alphaToCoverage=A.alphaToCoverage,this.premultipliedAlpha=A.premultipliedAlpha,this.forceSinglePass=A.forceSinglePass,this.visible=A.visible,this.toneMapped=A.toneMapped,this.userData=JSON.parse(JSON.stringify(A.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(A){A===!0&&this.version++}}class Il extends $r{constructor(A){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new RA(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(A)}copy(A){return super.copy(A),this.color.copy(A.color),this.map=A.map,this.lightMap=A.lightMap,this.lightMapIntensity=A.lightMapIntensity,this.aoMap=A.aoMap,this.aoMapIntensity=A.aoMapIntensity,this.specularMap=A.specularMap,this.alphaMap=A.alphaMap,this.envMap=A.envMap,this.combine=A.combine,this.reflectivity=A.reflectivity,this.refractionRatio=A.refractionRatio,this.wireframe=A.wireframe,this.wireframeLinewidth=A.wireframeLinewidth,this.wireframeLinecap=A.wireframeLinecap,this.wireframeLinejoin=A.wireframeLinejoin,this.fog=A.fog,this}}Cu();function Cu(){const r=new ArrayBuffer(4),A=new Float32Array(r),e=new Uint32Array(r),t=new Uint32Array(512),n=new Uint32Array(512);for(let s=0;s<256;++s){const l=s-127;l<-27?(t[s]=0,t[256|s]=32768,n[s]=24,n[256|s]=24):l<-14?(t[s]=1024>>-l-14,t[256|s]=1024>>-l-14|32768,n[s]=-l-1,n[256|s]=-l-1):l<=15?(t[s]=l+15<<10,t[256|s]=l+15<<10|32768,n[s]=13,n[256|s]=13):l<128?(t[s]=31744,t[256|s]=64512,n[s]=24,n[256|s]=24):(t[s]=31744,t[256|s]=64512,n[s]=13,n[256|s]=13)}const i=new Uint32Array(2048),a=new Uint32Array(64),o=new Uint32Array(64);for(let s=1;s<1024;++s){let l=s<<13,c=0;for(;(8388608&l)==0;)l<<=1,c-=8388608;l&=-8388609,c+=947912704,i[s]=l|c}for(let s=1024;s<2048;++s)i[s]=939524096+(s-1024<<13);for(let s=1;s<31;++s)a[s]=s<<23;a[31]=1199570944,a[32]=2147483648;for(let s=33;s<63;++s)a[s]=2147483648+(s-32<<23);a[63]=3347054592;for(let s=1;s<64;++s)s!==32&&(o[s]=1024);return{floatView:A,uint32View:e,baseTable:t,shiftTable:n,mantissaTable:i,exponentTable:a,offsetTable:o}}const XA=new Q,wn=new TA;class Xe{constructor(A,e,t=!1){if(Array.isArray(A))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=A,this.itemSize=e,this.count=A!==void 0?A.length/e:0,this.normalized=t,this.usage=35044,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(A){A===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(A){return this.usage=A,this}addUpdateRange(A,e){this.updateRanges.push({start:A,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(A){return this.name=A.name,this.array=new A.array.constructor(A.array),this.itemSize=A.itemSize,this.count=A.count,this.normalized=A.normalized,this.usage=A.usage,this.gpuType=A.gpuType,this}copyAt(A,e,t){A*=this.itemSize,t*=e.itemSize;for(let n=0,i=this.itemSize;n<i;n++)this.array[A+n]=e.array[t+n];return this}copyArray(A){return this.array.set(A),this}applyMatrix3(A){if(this.itemSize===2)for(let e=0,t=this.count;e<t;e++)wn.fromBufferAttribute(this,e),wn.applyMatrix3(A),this.setXY(e,wn.x,wn.y);else if(this.itemSize===3)for(let e=0,t=this.count;e<t;e++)XA.fromBufferAttribute(this,e),XA.applyMatrix3(A),this.setXYZ(e,XA.x,XA.y,XA.z);return this}applyMatrix4(A){for(let e=0,t=this.count;e<t;e++)XA.fromBufferAttribute(this,e),XA.applyMatrix4(A),this.setXYZ(e,XA.x,XA.y,XA.z);return this}applyNormalMatrix(A){for(let e=0,t=this.count;e<t;e++)XA.fromBufferAttribute(this,e),XA.applyNormalMatrix(A),this.setXYZ(e,XA.x,XA.y,XA.z);return this}transformDirection(A){for(let e=0,t=this.count;e<t;e++)XA.fromBufferAttribute(this,e),XA.transformDirection(A),this.setXYZ(e,XA.x,XA.y,XA.z);return this}set(A,e=0){return this.array.set(A,e),this}getComponent(A,e){let t=this.array[A*this.itemSize+e];return this.normalized&&(t=Ur(t,this.array)),t}setComponent(A,e,t){return this.normalized&&(t=ge(t,this.array)),this.array[A*this.itemSize+e]=t,this}getX(A){let e=this.array[A*this.itemSize];return this.normalized&&(e=Ur(e,this.array)),e}setX(A,e){return this.normalized&&(e=ge(e,this.array)),this.array[A*this.itemSize]=e,this}getY(A){let e=this.array[A*this.itemSize+1];return this.normalized&&(e=Ur(e,this.array)),e}setY(A,e){return this.normalized&&(e=ge(e,this.array)),this.array[A*this.itemSize+1]=e,this}getZ(A){let e=this.array[A*this.itemSize+2];return this.normalized&&(e=Ur(e,this.array)),e}setZ(A,e){return this.normalized&&(e=ge(e,this.array)),this.array[A*this.itemSize+2]=e,this}getW(A){let e=this.array[A*this.itemSize+3];return this.normalized&&(e=Ur(e,this.array)),e}setW(A,e){return this.normalized&&(e=ge(e,this.array)),this.array[A*this.itemSize+3]=e,this}setXY(A,e,t){return A*=this.itemSize,this.normalized&&(e=ge(e,this.array),t=ge(t,this.array)),this.array[A+0]=e,this.array[A+1]=t,this}setXYZ(A,e,t,n){return A*=this.itemSize,this.normalized&&(e=ge(e,this.array),t=ge(t,this.array),n=ge(n,this.array)),this.array[A+0]=e,this.array[A+1]=t,this.array[A+2]=n,this}setXYZW(A,e,t,n,i){return A*=this.itemSize,this.normalized&&(e=ge(e,this.array),t=ge(t,this.array),n=ge(n,this.array),i=ge(i,this.array)),this.array[A+0]=e,this.array[A+1]=t,this.array[A+2]=n,this.array[A+3]=i,this}onUpload(A){return this.onUploadCallback=A,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const A={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(A.name=this.name),this.usage!==35044&&(A.usage=this.usage),A}}class Ll extends Xe{constructor(A,e,t){super(new Uint16Array(A),e,t)}}class Rl extends Xe{constructor(A,e,t){super(new Uint32Array(A),e,t)}}class Ht extends Xe{constructor(A,e,t){super(new Float32Array(A),e,t)}}let Eu=0;const Se=new CA,ta=new ue,jt=new Q,Ee=new _t,Sr=new _t,ee=new Q;class Gt extends Br{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Eu++}),this.uuid=qr(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(A){return Array.isArray(A)?this.index=new(Ml(A)?Rl:Ll)(A,1):this.index=A,this}getAttribute(A){return this.attributes[A]}setAttribute(A,e){return this.attributes[A]=e,this}deleteAttribute(A){return delete this.attributes[A],this}hasAttribute(A){return this.attributes[A]!==void 0}addGroup(A,e,t=0){this.groups.push({start:A,count:e,materialIndex:t})}clearGroups(){this.groups=[]}setDrawRange(A,e){this.drawRange.start=A,this.drawRange.count=e}applyMatrix4(A){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(A),e.needsUpdate=!0);const t=this.attributes.normal;if(t!==void 0){const i=new UA().getNormalMatrix(A);t.applyNormalMatrix(i),t.needsUpdate=!0}const n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(A),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(A){return Se.makeRotationFromQuaternion(A),this.applyMatrix4(Se),this}rotateX(A){return Se.makeRotationX(A),this.applyMatrix4(Se),this}rotateY(A){return Se.makeRotationY(A),this.applyMatrix4(Se),this}rotateZ(A){return Se.makeRotationZ(A),this.applyMatrix4(Se),this}translate(A,e,t){return Se.makeTranslation(A,e,t),this.applyMatrix4(Se),this}scale(A,e,t){return Se.makeScale(A,e,t),this.applyMatrix4(Se),this}lookAt(A){return ta.lookAt(A),ta.updateMatrix(),this.applyMatrix4(ta.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(jt).negate(),this.translate(jt.x,jt.y,jt.z),this}setFromPoints(A){const e=[];for(let t=0,n=A.length;t<n;t++){const i=A[t];e.push(i.x,i.y,i.z||0)}return this.setAttribute("position",new Ht(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new _t);const A=this.attributes.position,e=this.morphAttributes.position;if(A&&A.isGLBufferAttribute)return console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),void this.boundingBox.set(new Q(-1/0,-1/0,-1/0),new Q(1/0,1/0,1/0));if(A!==void 0){if(this.boundingBox.setFromBufferAttribute(A),e)for(let t=0,n=e.length;t<n;t++){const i=e[t];Ee.setFromBufferAttribute(i),this.morphTargetsRelative?(ee.addVectors(this.boundingBox.min,Ee.min),this.boundingBox.expandByPoint(ee),ee.addVectors(this.boundingBox.max,Ee.max),this.boundingBox.expandByPoint(ee)):(this.boundingBox.expandByPoint(Ee.min),this.boundingBox.expandByPoint(Ee.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ct);const A=this.attributes.position,e=this.morphAttributes.position;if(A&&A.isGLBufferAttribute)return console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),void this.boundingSphere.set(new Q,1/0);if(A){const t=this.boundingSphere.center;if(Ee.setFromBufferAttribute(A),e)for(let i=0,a=e.length;i<a;i++){const o=e[i];Sr.setFromBufferAttribute(o),this.morphTargetsRelative?(ee.addVectors(Ee.min,Sr.min),Ee.expandByPoint(ee),ee.addVectors(Ee.max,Sr.max),Ee.expandByPoint(ee)):(Ee.expandByPoint(Sr.min),Ee.expandByPoint(Sr.max))}Ee.getCenter(t);let n=0;for(let i=0,a=A.count;i<a;i++)ee.fromBufferAttribute(A,i),n=Math.max(n,t.distanceToSquared(ee));if(e)for(let i=0,a=e.length;i<a;i++){const o=e[i],s=this.morphTargetsRelative;for(let l=0,c=o.count;l<c;l++)ee.fromBufferAttribute(o,l),s&&(jt.fromBufferAttribute(A,l),ee.add(jt)),n=Math.max(n,t.distanceToSquared(ee))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const A=this.index,e=this.attributes;if(A===null||e.position===void 0||e.normal===void 0||e.uv===void 0)return void console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");const t=A.array,n=e.position.array,i=e.normal.array,a=e.uv.array,o=n.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Xe(new Float32Array(4*o),4));const s=this.getAttribute("tangent").array,l=[],c=[];for(let L=0;L<o;L++)l[L]=new Q,c[L]=new Q;const u=new Q,h=new Q,d=new Q,g=new TA,m=new TA,f=new TA,v=new Q,p=new Q;function B(L,j,y){u.fromArray(n,3*L),h.fromArray(n,3*j),d.fromArray(n,3*y),g.fromArray(a,2*L),m.fromArray(a,2*j),f.fromArray(a,2*y),h.sub(u),d.sub(u),m.sub(g),f.sub(g);const H=1/(m.x*f.y-f.x*m.y);isFinite(H)&&(v.copy(h).multiplyScalar(f.y).addScaledVector(d,-m.y).multiplyScalar(H),p.copy(d).multiplyScalar(m.x).addScaledVector(h,-f.x).multiplyScalar(H),l[L].add(v),l[j].add(v),l[y].add(v),c[L].add(p),c[j].add(p),c[y].add(p))}let T=this.groups;T.length===0&&(T=[{start:0,count:t.length}]);for(let L=0,j=T.length;L<j;++L){const y=T[L],H=y.start;for(let D=H,AA=H+y.count;D<AA;D+=3)B(t[D+0],t[D+1],t[D+2])}const S=new Q,E=new Q,x=new Q,I=new Q;function M(L){x.fromArray(i,3*L),I.copy(x);const j=l[L];S.copy(j),S.sub(x.multiplyScalar(x.dot(j))).normalize(),E.crossVectors(I,j);const y=E.dot(c[L])<0?-1:1;s[4*L]=S.x,s[4*L+1]=S.y,s[4*L+2]=S.z,s[4*L+3]=y}for(let L=0,j=T.length;L<j;++L){const y=T[L],H=y.start;for(let D=H,AA=H+y.count;D<AA;D+=3)M(t[D+0]),M(t[D+1]),M(t[D+2])}}computeVertexNormals(){const A=this.index,e=this.getAttribute("position");if(e!==void 0){let t=this.getAttribute("normal");if(t===void 0)t=new Xe(new Float32Array(3*e.count),3),this.setAttribute("normal",t);else for(let h=0,d=t.count;h<d;h++)t.setXYZ(h,0,0,0);const n=new Q,i=new Q,a=new Q,o=new Q,s=new Q,l=new Q,c=new Q,u=new Q;if(A)for(let h=0,d=A.count;h<d;h+=3){const g=A.getX(h+0),m=A.getX(h+1),f=A.getX(h+2);n.fromBufferAttribute(e,g),i.fromBufferAttribute(e,m),a.fromBufferAttribute(e,f),c.subVectors(a,i),u.subVectors(n,i),c.cross(u),o.fromBufferAttribute(t,g),s.fromBufferAttribute(t,m),l.fromBufferAttribute(t,f),o.add(c),s.add(c),l.add(c),t.setXYZ(g,o.x,o.y,o.z),t.setXYZ(m,s.x,s.y,s.z),t.setXYZ(f,l.x,l.y,l.z)}else for(let h=0,d=e.count;h<d;h+=3)n.fromBufferAttribute(e,h+0),i.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),c.subVectors(a,i),u.subVectors(n,i),c.cross(u),t.setXYZ(h+0,c.x,c.y,c.z),t.setXYZ(h+1,c.x,c.y,c.z),t.setXYZ(h+2,c.x,c.y,c.z);this.normalizeNormals(),t.needsUpdate=!0}}normalizeNormals(){const A=this.attributes.normal;for(let e=0,t=A.count;e<t;e++)ee.fromBufferAttribute(A,e),ee.normalize(),A.setXYZ(e,ee.x,ee.y,ee.z)}toNonIndexed(){function A(o,s){const l=o.array,c=o.itemSize,u=o.normalized,h=new l.constructor(s.length*c);let d=0,g=0;for(let m=0,f=s.length;m<f;m++){d=o.isInterleavedBufferAttribute?s[m]*o.data.stride+o.offset:s[m]*c;for(let v=0;v<c;v++)h[g++]=l[d++]}return new Xe(h,c,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Gt,t=this.index.array,n=this.attributes;for(const o in n){const s=A(n[o],t);e.setAttribute(o,s)}const i=this.morphAttributes;for(const o in i){const s=[],l=i[o];for(let c=0,u=l.length;c<u;c++){const h=A(l[c],t);s.push(h)}e.morphAttributes[o]=s}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,s=a.length;o<s;o++){const l=a[o];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){const A={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(A.uuid=this.uuid,A.type=this.type,this.name!==""&&(A.name=this.name),Object.keys(this.userData).length>0&&(A.userData=this.userData),this.parameters!==void 0){const s=this.parameters;for(const l in s)s[l]!==void 0&&(A[l]=s[l]);return A}A.data={attributes:{}};const e=this.index;e!==null&&(A.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const t=this.attributes;for(const s in t){const l=t[s];A.data.attributes[s]=l.toJSON(A.data)}const n={};let i=!1;for(const s in this.morphAttributes){const l=this.morphAttributes[s],c=[];for(let u=0,h=l.length;u<h;u++){const d=l[u];c.push(d.toJSON(A.data))}c.length>0&&(n[s]=c,i=!0)}i&&(A.data.morphAttributes=n,A.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(A.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(A.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),A}clone(){return new this.constructor().copy(this)}copy(A){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=A.name;const t=A.index;t!==null&&this.setIndex(t.clone(e));const n=A.attributes;for(const l in n){const c=n[l];this.setAttribute(l,c.clone(e))}const i=A.morphAttributes;for(const l in i){const c=[],u=i[l];for(let h=0,d=u.length;h<d;h++)c.push(u[h].clone(e));this.morphAttributes[l]=c}this.morphTargetsRelative=A.morphTargetsRelative;const a=A.groups;for(let l=0,c=a.length;l<c;l++){const u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}const o=A.boundingBox;o!==null&&(this.boundingBox=o.clone());const s=A.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=A.drawRange.start,this.drawRange.count=A.drawRange.count,this.userData=A.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Xs=new CA,Ft=new wi,_n=new Ct,Ys=new Q,$t=new Q,Ar=new Q,er=new Q,ra=new Q,Cn=new Q,En=new TA,Un=new TA,xn=new TA,Js=new Q,Zs=new Q,qs=new Q,yn=new Q,Mn=new Q;class be extends ue{constructor(A=new Gt,e=new Il){super(),this.isMesh=!0,this.type="Mesh",this.geometry=A,this.material=e,this.updateMorphTargets()}copy(A,e){return super.copy(A,e),A.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=A.morphTargetInfluences.slice()),A.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},A.morphTargetDictionary)),this.material=Array.isArray(A.material)?A.material.slice():A.material,this.geometry=A.geometry,this}updateMorphTargets(){const A=this.geometry.morphAttributes,e=Object.keys(A);if(e.length>0){const t=A[e[0]];if(t!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++){const a=t[n].name||String(n);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=n}}}}getVertexPosition(A,e){const t=this.geometry,n=t.attributes.position,i=t.morphAttributes.position,a=t.morphTargetsRelative;e.fromBufferAttribute(n,A);const o=this.morphTargetInfluences;if(i&&o){Cn.set(0,0,0);for(let s=0,l=i.length;s<l;s++){const c=o[s],u=i[s];c!==0&&(ra.fromBufferAttribute(u,A),a?Cn.addScaledVector(ra,c):Cn.addScaledVector(ra.sub(e),c))}e.add(Cn)}return e}raycast(A,e){const t=this.geometry,n=this.material,i=this.matrixWorld;if(n!==void 0){if(t.boundingSphere===null&&t.computeBoundingSphere(),_n.copy(t.boundingSphere),_n.applyMatrix4(i),Ft.copy(A.ray).recast(A.near),_n.containsPoint(Ft.origin)===!1&&(Ft.intersectSphere(_n,Ys)===null||Ft.origin.distanceToSquared(Ys)>(A.far-A.near)**2))return;Xs.copy(i).invert(),Ft.copy(A.ray).applyMatrix4(Xs),t.boundingBox!==null&&Ft.intersectsBox(t.boundingBox)===!1||this._computeIntersections(A,e,Ft)}}_computeIntersections(A,e,t){let n;const i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,l=i.attributes.uv,c=i.attributes.uv1,u=i.attributes.normal,h=i.groups,d=i.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,m=h.length;g<m;g++){const f=h[g],v=a[f.materialIndex];for(let p=Math.max(f.start,d.start),B=Math.min(o.count,Math.min(f.start+f.count,d.start+d.count));p<B;p+=3)n=Sn(this,v,A,t,l,c,u,o.getX(p),o.getX(p+1),o.getX(p+2)),n&&(n.faceIndex=Math.floor(p/3),n.face.materialIndex=f.materialIndex,e.push(n))}else for(let g=Math.max(0,d.start),m=Math.min(o.count,d.start+d.count);g<m;g+=3)n=Sn(this,a,A,t,l,c,u,o.getX(g),o.getX(g+1),o.getX(g+2)),n&&(n.faceIndex=Math.floor(g/3),e.push(n));else if(s!==void 0)if(Array.isArray(a))for(let g=0,m=h.length;g<m;g++){const f=h[g],v=a[f.materialIndex];for(let p=Math.max(f.start,d.start),B=Math.min(s.count,Math.min(f.start+f.count,d.start+d.count));p<B;p+=3)n=Sn(this,v,A,t,l,c,u,p,p+1,p+2),n&&(n.faceIndex=Math.floor(p/3),n.face.materialIndex=f.materialIndex,e.push(n))}else for(let g=Math.max(0,d.start),m=Math.min(s.count,d.start+d.count);g<m;g+=3)n=Sn(this,a,A,t,l,c,u,g,g+1,g+2),n&&(n.faceIndex=Math.floor(g/3),e.push(n))}}function Sn(r,A,e,t,n,i,a,o,s,l){r.getVertexPosition(o,$t),r.getVertexPosition(s,Ar),r.getVertexPosition(l,er);const c=(function(u,h,d,g,m,f,v,p){let B;if(B=h.side===1?g.intersectTriangle(v,f,m,!0,p):g.intersectTriangle(m,f,v,h.side===0,p),B===null)return null;Mn.copy(p),Mn.applyMatrix4(u.matrixWorld);const T=d.ray.origin.distanceTo(Mn);return T<d.near||T>d.far?null:{distance:T,point:Mn.clone(),object:u}})(r,A,e,t,$t,Ar,er,yn);if(c){n&&(En.fromBufferAttribute(n,o),Un.fromBufferAttribute(n,s),xn.fromBufferAttribute(n,l),c.uv=Te.getInterpolation(yn,$t,Ar,er,En,Un,xn,new TA)),i&&(En.fromBufferAttribute(i,o),Un.fromBufferAttribute(i,s),xn.fromBufferAttribute(i,l),c.uv1=Te.getInterpolation(yn,$t,Ar,er,En,Un,xn,new TA),c.uv2=c.uv1),a&&(Js.fromBufferAttribute(a,o),Zs.fromBufferAttribute(a,s),qs.fromBufferAttribute(a,l),c.normal=Te.getInterpolation(yn,$t,Ar,er,Js,Zs,qs,new Q),c.normal.dot(t.direction)>0&&c.normal.multiplyScalar(-1));const u={a:o,b:s,c:l,normal:new Q,materialIndex:0};Te.getNormal($t,Ar,er,u.normal),c.face=u}return c}class An extends Gt{constructor(A=1,e=1,t=1,n=1,i=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:A,height:e,depth:t,widthSegments:n,heightSegments:i,depthSegments:a};const o=this;n=Math.floor(n),i=Math.floor(i),a=Math.floor(a);const s=[],l=[],c=[],u=[];let h=0,d=0;function g(m,f,v,p,B,T,S,E,x,I,M){const L=T/x,j=S/I,y=T/2,H=S/2,D=E/2,AA=x+1,iA=I+1;let k=0,G=0;const W=new Q;for(let R=0;R<iA;R++){const V=R*j-H;for(let rA=0;rA<AA;rA++){const w=rA*L-y;W[m]=w*p,W[f]=V*B,W[v]=D,l.push(W.x,W.y,W.z),W[m]=0,W[f]=0,W[v]=E>0?1:-1,c.push(W.x,W.y,W.z),u.push(rA/x),u.push(1-R/I),k+=1}}for(let R=0;R<I;R++)for(let V=0;V<x;V++){const rA=h+V+AA*R,w=h+V+AA*(R+1),_=h+(V+1)+AA*(R+1),b=h+(V+1)+AA*R;s.push(rA,w,b),s.push(w,_,b),G+=6}o.addGroup(d,G,M),d+=G,h+=k}g("z","y","x",-1,-1,t,e,A,a,i,0),g("z","y","x",1,-1,t,e,-A,a,i,1),g("x","z","y",1,1,A,t,e,n,a,2),g("x","z","y",1,-1,A,t,-e,n,a,3),g("x","y","z",1,-1,A,e,t,n,i,4),g("x","y","z",-1,-1,A,e,-t,n,i,5),this.setIndex(s),this.setAttribute("position",new Ht(l,3)),this.setAttribute("normal",new Ht(c,3)),this.setAttribute("uv",new Ht(u,2))}copy(A){return super.copy(A),this.parameters=Object.assign({},A.parameters),this}static fromJSON(A){return new An(A.width,A.height,A.depth,A.widthSegments,A.heightSegments,A.depthSegments)}}function gr(r){const A={};for(const e in r){A[e]={};for(const t in r[e]){const n=r[e][t];n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)?n.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),A[e][t]=null):A[e][t]=n.clone():Array.isArray(n)?A[e][t]=n.slice():A[e][t]=n}}return A}function de(r){const A={};for(let e=0;e<r.length;e++){const t=gr(r[e]);for(const n in t)A[n]=t[n]}return A}function Hl(r){return r.getRenderTarget()===null?r.outputColorSpace:PA.workingColorSpace}const Uu={clone:gr,merge:de};class Nt extends $r{constructor(A){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,this.fragmentShader=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,A!==void 0&&this.setValues(A)}copy(A){return super.copy(A),this.fragmentShader=A.fragmentShader,this.vertexShader=A.vertexShader,this.uniforms=gr(A.uniforms),this.uniformsGroups=(function(e){const t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t})(A.uniformsGroups),this.defines=Object.assign({},A.defines),this.wireframe=A.wireframe,this.wireframeLinewidth=A.wireframeLinewidth,this.fog=A.fog,this.lights=A.lights,this.clipping=A.clipping,this.extensions=Object.assign({},A.extensions),this.glslVersion=A.glslVersion,this}toJSON(A){const e=super.toJSON(A);e.glslVersion=this.glslVersion,e.uniforms={};for(const n in this.uniforms){const i=this.uniforms[n].value;i&&i.isTexture?e.uniforms[n]={type:"t",value:i.toJSON(A).uuid}:i&&i.isColor?e.uniforms[n]={type:"c",value:i.getHex()}:i&&i.isVector2?e.uniforms[n]={type:"v2",value:i.toArray()}:i&&i.isVector3?e.uniforms[n]={type:"v3",value:i.toArray()}:i&&i.isVector4?e.uniforms[n]={type:"v4",value:i.toArray()}:i&&i.isMatrix3?e.uniforms[n]={type:"m3",value:i.toArray()}:i&&i.isMatrix4?e.uniforms[n]={type:"m4",value:i.toArray()}:e.uniforms[n]={value:i}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const t={};for(const n in this.extensions)this.extensions[n]===!0&&(t[n]=!0);return Object.keys(t).length>0&&(e.extensions=t),e}}class ss extends ue{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new CA,this.projectionMatrix=new CA,this.projectionMatrixInverse=new CA,this.coordinateSystem=2e3}copy(A,e){return super.copy(A,e),this.matrixWorldInverse.copy(A.matrixWorldInverse),this.projectionMatrix.copy(A.projectionMatrix),this.projectionMatrixInverse.copy(A.projectionMatrixInverse),this.coordinateSystem=A.coordinateSystem,this}getWorldDirection(A){return super.getWorldDirection(A).negate()}updateMatrixWorld(A){super.updateMatrixWorld(A),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(A,e){super.updateWorldMatrix(A,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class Ve extends ss{constructor(A=50,e=1,t=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=A,this.zoom=1,this.near=t,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(A,e){return super.copy(A,e),this.fov=A.fov,this.zoom=A.zoom,this.near=A.near,this.far=A.far,this.focus=A.focus,this.aspect=A.aspect,this.view=A.view===null?null:Object.assign({},A.view),this.filmGauge=A.filmGauge,this.filmOffset=A.filmOffset,this}setFocalLength(A){const e=.5*this.getFilmHeight()/A;this.fov=2*La*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const A=Math.tan(.5*Ni*this.fov);return .5*this.getFilmHeight()/A}getEffectiveFOV(){return 2*La*Math.atan(Math.tan(.5*Ni*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(A,e,t,n,i,a){this.aspect=A/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=A,this.view.fullHeight=e,this.view.offsetX=t,this.view.offsetY=n,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const A=this.near;let e=A*Math.tan(.5*Ni*this.fov)/this.zoom,t=2*e,n=this.aspect*t,i=-.5*n;const a=this.view;if(this.view!==null&&this.view.enabled){const s=a.fullWidth,l=a.fullHeight;i+=a.offsetX*n/s,e-=a.offsetY*t/l,n*=a.width/s,t*=a.height/l}const o=this.filmOffset;o!==0&&(i+=A*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+n,e,e-t,A,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(A){const e=super.toJSON(A);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const tr=-90;class xu extends ue{constructor(A,e,t){super(),this.type="CubeCamera",this.renderTarget=t,this.coordinateSystem=null,this.activeMipmapLevel=0;const n=new Ve(tr,1,A,e);n.layers=this.layers,this.add(n);const i=new Ve(tr,1,A,e);i.layers=this.layers,this.add(i);const a=new Ve(tr,1,A,e);a.layers=this.layers,this.add(a);const o=new Ve(tr,1,A,e);o.layers=this.layers,this.add(o);const s=new Ve(tr,1,A,e);s.layers=this.layers,this.add(s);const l=new Ve(tr,1,A,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const A=this.coordinateSystem,e=this.children.concat(),[t,n,i,a,o,s]=e;for(const l of e)this.remove(l);if(A===2e3)t.up.set(0,1,0),t.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else{if(A!==2001)throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+A);t.up.set(0,-1,0),t.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1)}for(const l of e)this.add(l),l.updateMatrixWorld()}update(A,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:t,activeMipmapLevel:n}=this;this.coordinateSystem!==A.coordinateSystem&&(this.coordinateSystem=A.coordinateSystem,this.updateCoordinateSystem());const[i,a,o,s,l,c]=this.children,u=A.getRenderTarget(),h=A.getActiveCubeFace(),d=A.getActiveMipmapLevel(),g=A.xr.enabled;A.xr.enabled=!1;const m=t.texture.generateMipmaps;t.texture.generateMipmaps=!1,A.setRenderTarget(t,0,n),A.render(e,i),A.setRenderTarget(t,1,n),A.render(e,a),A.setRenderTarget(t,2,n),A.render(e,o),A.setRenderTarget(t,3,n),A.render(e,s),A.setRenderTarget(t,4,n),A.render(e,l),t.texture.generateMipmaps=m,A.setRenderTarget(t,5,n),A.render(e,c),A.setRenderTarget(u,h,d),A.xr.enabled=g,t.texture.needsPMREMUpdate=!0}}class Dl extends we{constructor(A,e,t,n,i,a,o,s,l,c){super(A=A!==void 0?A:[],e=e!==void 0?e:301,t,n,i,a,o,s,l,c),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(A){this.image=A}}class yu extends Ot{constructor(A=1,e={}){super(A,A,e),this.isWebGLCubeRenderTarget=!0;const t={width:A,height:A,depth:1},n=[t,t,t,t,t,t];e.encoding!==void 0&&(Vr("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),e.colorSpace=e.encoding===3001?YA:""),this.texture=new Dl(n,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0&&e.generateMipmaps,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:1006}fromEquirectangularTexture(A,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const t={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},n=new An(5,5,5),i=new Nt({name:"CubemapFromEquirect",uniforms:gr(t.uniforms),vertexShader:t.vertexShader,fragmentShader:t.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=e;const a=new be(n,i),o=e.minFilter;return e.minFilter===1008&&(e.minFilter=1006),new xu(1,10,this).update(A,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(A,e,t,n){const i=A.getRenderTarget();for(let a=0;a<6;a++)A.setRenderTarget(this,a),A.clear(e,t,n);A.setRenderTarget(i)}}const na=new Q,Mu=new Q,Su=new UA;class bt{constructor(A=new Q(1,0,0),e=0){this.isPlane=!0,this.normal=A,this.constant=e}set(A,e){return this.normal.copy(A),this.constant=e,this}setComponents(A,e,t,n){return this.normal.set(A,e,t),this.constant=n,this}setFromNormalAndCoplanarPoint(A,e){return this.normal.copy(A),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(A,e,t){const n=na.subVectors(t,e).cross(Mu.subVectors(A,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,A),this}copy(A){return this.normal.copy(A.normal),this.constant=A.constant,this}normalize(){const A=1/this.normal.length();return this.normal.multiplyScalar(A),this.constant*=A,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(A){return this.normal.dot(A)+this.constant}distanceToSphere(A){return this.distanceToPoint(A.center)-A.radius}projectPoint(A,e){return e.copy(A).addScaledVector(this.normal,-this.distanceToPoint(A))}intersectLine(A,e){const t=A.delta(na),n=this.normal.dot(t);if(n===0)return this.distanceToPoint(A.start)===0?e.copy(A.start):null;const i=-(A.start.dot(this.normal)+this.constant)/n;return i<0||i>1?null:e.copy(A.start).addScaledVector(t,i)}intersectsLine(A){const e=this.distanceToPoint(A.start),t=this.distanceToPoint(A.end);return e<0&&t>0||t<0&&e>0}intersectsBox(A){return A.intersectsPlane(this)}intersectsSphere(A){return A.intersectsPlane(this)}coplanarPoint(A){return A.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(A,e){const t=e||Su.getNormalMatrix(A),n=this.coplanarPoint(na).applyMatrix4(A),i=this.normal.applyMatrix3(t).normalize();return this.constant=-n.dot(i),this}translate(A){return this.constant-=A.dot(this.normal),this}equals(A){return A.normal.equals(this.normal)&&A.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Tt=new Ct,Fn=new Q;class Ci{constructor(A=new bt,e=new bt,t=new bt,n=new bt,i=new bt,a=new bt){this.planes=[A,e,t,n,i,a]}set(A,e,t,n,i,a){const o=this.planes;return o[0].copy(A),o[1].copy(e),o[2].copy(t),o[3].copy(n),o[4].copy(i),o[5].copy(a),this}copy(A){const e=this.planes;for(let t=0;t<6;t++)e[t].copy(A.planes[t]);return this}setFromProjectionMatrix(A,e=2e3){const t=this.planes,n=A.elements,i=n[0],a=n[1],o=n[2],s=n[3],l=n[4],c=n[5],u=n[6],h=n[7],d=n[8],g=n[9],m=n[10],f=n[11],v=n[12],p=n[13],B=n[14],T=n[15];if(t[0].setComponents(s-i,h-l,f-d,T-v).normalize(),t[1].setComponents(s+i,h+l,f+d,T+v).normalize(),t[2].setComponents(s+a,h+c,f+g,T+p).normalize(),t[3].setComponents(s-a,h-c,f-g,T-p).normalize(),t[4].setComponents(s-o,h-u,f-m,T-B).normalize(),e===2e3)t[5].setComponents(s+o,h+u,f+m,T+B).normalize();else{if(e!==2001)throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);t[5].setComponents(o,u,m,B).normalize()}return this}intersectsObject(A){if(A.boundingSphere!==void 0)A.boundingSphere===null&&A.computeBoundingSphere(),Tt.copy(A.boundingSphere).applyMatrix4(A.matrixWorld);else{const e=A.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Tt.copy(e.boundingSphere).applyMatrix4(A.matrixWorld)}return this.intersectsSphere(Tt)}intersectsSprite(A){return Tt.center.set(0,0,0),Tt.radius=.7071067811865476,Tt.applyMatrix4(A.matrixWorld),this.intersectsSphere(Tt)}intersectsSphere(A){const e=this.planes,t=A.center,n=-A.radius;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<n)return!1;return!0}intersectsBox(A){const e=this.planes;for(let t=0;t<6;t++){const n=e[t];if(Fn.x=n.normal.x>0?A.max.x:A.min.x,Fn.y=n.normal.y>0?A.max.y:A.min.y,Fn.z=n.normal.z>0?A.max.z:A.min.z,n.distanceToPoint(Fn)<0)return!1}return!0}containsPoint(A){const e=this.planes;for(let t=0;t<6;t++)if(e[t].distanceToPoint(A)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Pl(){let r=null,A=!1,e=null,t=null;function n(i,a){e(i,a),t=r.requestAnimationFrame(n)}return{start:function(){A!==!0&&e!==null&&(t=r.requestAnimationFrame(n),A=!0)},stop:function(){r.cancelAnimationFrame(t),A=!1},setAnimationLoop:function(i){e=i},setContext:function(i){r=i}}}function Fu(r,A){const e=A.isWebGL2,t=new WeakMap;return{get:function(n){return n.isInterleavedBufferAttribute&&(n=n.data),t.get(n)},remove:function(n){n.isInterleavedBufferAttribute&&(n=n.data);const i=t.get(n);i&&(r.deleteBuffer(i.buffer),t.delete(n))},update:function(n,i){if(n.isGLBufferAttribute){const o=t.get(n);return void((!o||o.version<n.version)&&t.set(n,{buffer:n.buffer,type:n.type,bytesPerElement:n.elementSize,version:n.version}))}n.isInterleavedBufferAttribute&&(n=n.data);const a=t.get(n);if(a===void 0)t.set(n,(function(o,s){const l=o.array,c=o.usage,u=l.byteLength,h=r.createBuffer();let d;if(r.bindBuffer(s,h),r.bufferData(s,l,c),o.onUploadCallback(),l instanceof Float32Array)d=r.FLOAT;else if(l instanceof Uint16Array)if(o.isFloat16BufferAttribute){if(!e)throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");d=r.HALF_FLOAT}else d=r.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=r.SHORT;else if(l instanceof Uint32Array)d=r.UNSIGNED_INT;else if(l instanceof Int32Array)d=r.INT;else if(l instanceof Int8Array)d=r.BYTE;else if(l instanceof Uint8Array)d=r.UNSIGNED_BYTE;else{if(!(l instanceof Uint8ClampedArray))throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);d=r.UNSIGNED_BYTE}return{buffer:h,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:u}})(n,i));else if(a.version<n.version){if(a.size!==n.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");(function(o,s,l){const c=s.array,u=s._updateRange,h=s.updateRanges;if(r.bindBuffer(l,o),u.count===-1&&h.length===0&&r.bufferSubData(l,0,c),h.length!==0){for(let d=0,g=h.length;d<g;d++){const m=h[d];e?r.bufferSubData(l,m.start*c.BYTES_PER_ELEMENT,c,m.start,m.count):r.bufferSubData(l,m.start*c.BYTES_PER_ELEMENT,c.subarray(m.start,m.start+m.count))}s.clearUpdateRanges()}u.count!==-1&&(e?r.bufferSubData(l,u.offset*c.BYTES_PER_ELEMENT,c,u.offset,u.count):r.bufferSubData(l,u.offset*c.BYTES_PER_ELEMENT,c.subarray(u.offset,u.offset+u.count)),u.count=-1),s.onUploadCallback()})(a.buffer,n,i),a.version=n.version}}}}class Ei extends Gt{constructor(A=1,e=1,t=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:A,height:e,widthSegments:t,heightSegments:n};const i=A/2,a=e/2,o=Math.floor(t),s=Math.floor(n),l=o+1,c=s+1,u=A/o,h=e/s,d=[],g=[],m=[],f=[];for(let v=0;v<c;v++){const p=v*h-a;for(let B=0;B<l;B++){const T=B*u-i;g.push(T,-p,0),m.push(0,0,1),f.push(B/o),f.push(1-v/s)}}for(let v=0;v<s;v++)for(let p=0;p<o;p++){const B=p+l*v,T=p+l*(v+1),S=p+1+l*(v+1),E=p+1+l*v;d.push(B,T,E),d.push(T,S,E)}this.setIndex(d),this.setAttribute("position",new Ht(g,3)),this.setAttribute("normal",new Ht(m,3)),this.setAttribute("uv",new Ht(f,2))}copy(A){return super.copy(A),this.parameters=Object.assign({},A.parameters),this}static fromJSON(A){return new Ei(A.width,A.height,A.widthSegments,A.heightSegments)}}const _A={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:"gl_FragColor = linearToOutputTexel( gl_FragColor );",colorspace_pars_fragment:`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_fragment:`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},nA={common:{diffuse:{value:new RA(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new UA},alphaMap:{value:null},alphaMapTransform:{value:new UA},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new UA}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new UA}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new UA}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new UA},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new UA},normalScale:{value:new TA(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new UA},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new UA}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new UA}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new UA}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new RA(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new RA(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new UA},alphaTest:{value:0},uvTransform:{value:new UA}},sprite:{diffuse:{value:new RA(16777215)},opacity:{value:1},center:{value:new TA(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new UA},alphaMap:{value:null},alphaMapTransform:{value:new UA},alphaTest:{value:0}}},We={basic:{uniforms:de([nA.common,nA.specularmap,nA.envmap,nA.aomap,nA.lightmap,nA.fog]),vertexShader:_A.meshbasic_vert,fragmentShader:_A.meshbasic_frag},lambert:{uniforms:de([nA.common,nA.specularmap,nA.envmap,nA.aomap,nA.lightmap,nA.emissivemap,nA.bumpmap,nA.normalmap,nA.displacementmap,nA.fog,nA.lights,{emissive:{value:new RA(0)}}]),vertexShader:_A.meshlambert_vert,fragmentShader:_A.meshlambert_frag},phong:{uniforms:de([nA.common,nA.specularmap,nA.envmap,nA.aomap,nA.lightmap,nA.emissivemap,nA.bumpmap,nA.normalmap,nA.displacementmap,nA.fog,nA.lights,{emissive:{value:new RA(0)},specular:{value:new RA(1118481)},shininess:{value:30}}]),vertexShader:_A.meshphong_vert,fragmentShader:_A.meshphong_frag},standard:{uniforms:de([nA.common,nA.envmap,nA.aomap,nA.lightmap,nA.emissivemap,nA.bumpmap,nA.normalmap,nA.displacementmap,nA.roughnessmap,nA.metalnessmap,nA.fog,nA.lights,{emissive:{value:new RA(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:_A.meshphysical_vert,fragmentShader:_A.meshphysical_frag},toon:{uniforms:de([nA.common,nA.aomap,nA.lightmap,nA.emissivemap,nA.bumpmap,nA.normalmap,nA.displacementmap,nA.gradientmap,nA.fog,nA.lights,{emissive:{value:new RA(0)}}]),vertexShader:_A.meshtoon_vert,fragmentShader:_A.meshtoon_frag},matcap:{uniforms:de([nA.common,nA.bumpmap,nA.normalmap,nA.displacementmap,nA.fog,{matcap:{value:null}}]),vertexShader:_A.meshmatcap_vert,fragmentShader:_A.meshmatcap_frag},points:{uniforms:de([nA.points,nA.fog]),vertexShader:_A.points_vert,fragmentShader:_A.points_frag},dashed:{uniforms:de([nA.common,nA.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:_A.linedashed_vert,fragmentShader:_A.linedashed_frag},depth:{uniforms:de([nA.common,nA.displacementmap]),vertexShader:_A.depth_vert,fragmentShader:_A.depth_frag},normal:{uniforms:de([nA.common,nA.bumpmap,nA.normalmap,nA.displacementmap,{opacity:{value:1}}]),vertexShader:_A.meshnormal_vert,fragmentShader:_A.meshnormal_frag},sprite:{uniforms:de([nA.sprite,nA.fog]),vertexShader:_A.sprite_vert,fragmentShader:_A.sprite_frag},background:{uniforms:{uvTransform:{value:new UA},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:_A.background_vert,fragmentShader:_A.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:_A.backgroundCube_vert,fragmentShader:_A.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:_A.cube_vert,fragmentShader:_A.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:_A.equirect_vert,fragmentShader:_A.equirect_frag},distanceRGBA:{uniforms:de([nA.common,nA.displacementmap,{referencePosition:{value:new Q},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:_A.distanceRGBA_vert,fragmentShader:_A.distanceRGBA_frag},shadow:{uniforms:de([nA.lights,nA.fog,{color:{value:new RA(0)},opacity:{value:1}}]),vertexShader:_A.shadow_vert,fragmentShader:_A.shadow_frag}};We.physical={uniforms:de([We.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new UA},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new UA},clearcoatNormalScale:{value:new TA(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new UA},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new UA},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new UA},sheen:{value:0},sheenColor:{value:new RA(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new UA},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new UA},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new UA},transmissionSamplerSize:{value:new TA},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new UA},attenuationDistance:{value:0},attenuationColor:{value:new RA(0)},specularColor:{value:new RA(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new UA},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new UA},anisotropyVector:{value:new TA},anisotropyMap:{value:null},anisotropyMapTransform:{value:new UA}}]),vertexShader:_A.meshphysical_vert,fragmentShader:_A.meshphysical_frag};const Tn={r:0,b:0,g:0};function Tu(r,A,e,t,n,i,a){const o=new RA(0);let s,l,c=i===!0?0:1,u=null,h=0,d=null;function g(m,f){m.getRGB(Tn,Hl(r)),t.buffers.color.setClear(Tn.r,Tn.g,Tn.b,f,a)}return{getClearColor:function(){return o},setClearColor:function(m,f=1){o.set(m),c=f,g(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(m){c=m,g(o,c)},render:function(m,f){let v=!1,p=f.isScene===!0?f.background:null;p&&p.isTexture&&(p=(f.backgroundBlurriness>0?e:A).get(p)),p===null?g(o,c):p&&p.isColor&&(g(p,1),v=!0);const B=r.xr.getEnvironmentBlendMode();B==="additive"?t.buffers.color.setClear(0,0,0,1,a):B==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,a),(r.autoClear||v)&&r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil),p&&(p.isCubeTexture||p.mapping===306)?(l===void 0&&(l=new be(new An(1,1,1),new Nt({name:"BackgroundCubeMaterial",uniforms:gr(We.backgroundCube.uniforms),vertexShader:We.backgroundCube.vertexShader,fragmentShader:We.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,S,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=p,l.material.uniforms.flipEnvMap.value=p.isCubeTexture&&p.isRenderTargetTexture===!1?-1:1,l.material.uniforms.backgroundBlurriness.value=f.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,l.material.toneMapped=PA.getTransfer(p.colorSpace)!==GA,u===p&&h===p.version&&d===r.toneMapping||(l.material.needsUpdate=!0,u=p,h=p.version,d=r.toneMapping),l.layers.enableAll(),m.unshift(l,l.geometry,l.material,0,0,null)):p&&p.isTexture&&(s===void 0&&(s=new be(new Ei(2,2),new Nt({name:"BackgroundMaterial",uniforms:gr(We.background.uniforms),vertexShader:We.background.vertexShader,fragmentShader:We.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),s.geometry.deleteAttribute("normal"),Object.defineProperty(s.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(s)),s.material.uniforms.t2D.value=p,s.material.uniforms.backgroundIntensity.value=f.backgroundIntensity,s.material.toneMapped=PA.getTransfer(p.colorSpace)!==GA,p.matrixAutoUpdate===!0&&p.updateMatrix(),s.material.uniforms.uvTransform.value.copy(p.matrix),u===p&&h===p.version&&d===r.toneMapping||(s.material.needsUpdate=!0,u=p,h=p.version,d=r.toneMapping),s.layers.enableAll(),m.unshift(s,s.geometry,s.material,0,0,null))}}}function Qu(r,A,e,t){const n=r.getParameter(r.MAX_VERTEX_ATTRIBS),i=t.isWebGL2?null:A.get("OES_vertex_array_object"),a=t.isWebGL2||i!==null,o={},s=d(null);let l=s,c=!1;function u(S){return t.isWebGL2?r.bindVertexArray(S):i.bindVertexArrayOES(S)}function h(S){return t.isWebGL2?r.deleteVertexArray(S):i.deleteVertexArrayOES(S)}function d(S){const E=[],x=[],I=[];for(let M=0;M<n;M++)E[M]=0,x[M]=0,I[M]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:E,enabledAttributes:x,attributeDivisors:I,object:S,attributes:{},index:null}}function g(){const S=l.newAttributes;for(let E=0,x=S.length;E<x;E++)S[E]=0}function m(S){f(S,0)}function f(S,E){const x=l.newAttributes,I=l.enabledAttributes,M=l.attributeDivisors;x[S]=1,I[S]===0&&(r.enableVertexAttribArray(S),I[S]=1),M[S]!==E&&((t.isWebGL2?r:A.get("ANGLE_instanced_arrays"))[t.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](S,E),M[S]=E)}function v(){const S=l.newAttributes,E=l.enabledAttributes;for(let x=0,I=E.length;x<I;x++)E[x]!==S[x]&&(r.disableVertexAttribArray(x),E[x]=0)}function p(S,E,x,I,M,L,j){j===!0?r.vertexAttribIPointer(S,E,x,M,L):r.vertexAttribPointer(S,E,x,I,M,L)}function B(){T(),c=!0,l!==s&&(l=s,u(l.object))}function T(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:function(S,E,x,I,M){let L=!1;if(a){const j=(function(y,H,D){const AA=D.wireframe===!0;let iA=o[y.id];iA===void 0&&(iA={},o[y.id]=iA);let k=iA[H.id];k===void 0&&(k={},iA[H.id]=k);let G=k[AA];return G===void 0&&(G=d(t.isWebGL2?r.createVertexArray():i.createVertexArrayOES()),k[AA]=G),G})(I,x,E);l!==j&&(l=j,u(l.object)),L=(function(y,H,D,AA){const iA=l.attributes,k=H.attributes;let G=0;const W=D.getAttributes();for(const R in W)if(W[R].location>=0){const V=iA[R];let rA=k[R];if(rA===void 0&&(R==="instanceMatrix"&&y.instanceMatrix&&(rA=y.instanceMatrix),R==="instanceColor"&&y.instanceColor&&(rA=y.instanceColor)),V===void 0||V.attribute!==rA||rA&&V.data!==rA.data)return!0;G++}return l.attributesNum!==G||l.index!==AA})(S,I,x,M),L&&(function(y,H,D,AA){const iA={},k=H.attributes;let G=0;const W=D.getAttributes();for(const R in W)if(W[R].location>=0){let V=k[R];V===void 0&&(R==="instanceMatrix"&&y.instanceMatrix&&(V=y.instanceMatrix),R==="instanceColor"&&y.instanceColor&&(V=y.instanceColor));const rA={};rA.attribute=V,V&&V.data&&(rA.data=V.data),iA[R]=rA,G++}l.attributes=iA,l.attributesNum=G,l.index=AA})(S,I,x,M)}else{const j=E.wireframe===!0;l.geometry===I.id&&l.program===x.id&&l.wireframe===j||(l.geometry=I.id,l.program=x.id,l.wireframe=j,L=!0)}M!==null&&e.update(M,r.ELEMENT_ARRAY_BUFFER),(L||c)&&(c=!1,(function(j,y,H,D){if(t.isWebGL2===!1&&(j.isInstancedMesh||D.isInstancedBufferGeometry)&&A.get("ANGLE_instanced_arrays")===null)return;g();const AA=D.attributes,iA=H.getAttributes(),k=y.defaultAttributeValues;for(const G in iA){const W=iA[G];if(W.location>=0){let R=AA[G];if(R===void 0&&(G==="instanceMatrix"&&j.instanceMatrix&&(R=j.instanceMatrix),G==="instanceColor"&&j.instanceColor&&(R=j.instanceColor)),R!==void 0){const V=R.normalized,rA=R.itemSize,w=e.get(R);if(w===void 0)continue;const _=w.buffer,b=w.type,O=w.bytesPerElement,F=t.isWebGL2===!0&&(b===r.INT||b===r.UNSIGNED_INT||R.gpuType===1013);if(R.isInterleavedBufferAttribute){const X=R.data,Z=X.stride,q=R.offset;if(X.isInstancedInterleavedBuffer){for(let tA=0;tA<W.locationSize;tA++)f(W.location+tA,X.meshPerAttribute);j.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let tA=0;tA<W.locationSize;tA++)m(W.location+tA);r.bindBuffer(r.ARRAY_BUFFER,_);for(let tA=0;tA<W.locationSize;tA++)p(W.location+tA,rA/W.locationSize,b,V,Z*O,(q+rA/W.locationSize*tA)*O,F)}else{if(R.isInstancedBufferAttribute){for(let X=0;X<W.locationSize;X++)f(W.location+X,R.meshPerAttribute);j.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=R.meshPerAttribute*R.count)}else for(let X=0;X<W.locationSize;X++)m(W.location+X);r.bindBuffer(r.ARRAY_BUFFER,_);for(let X=0;X<W.locationSize;X++)p(W.location+X,rA/W.locationSize,b,V,rA*O,rA/W.locationSize*X*O,F)}}else if(k!==void 0){const V=k[G];if(V!==void 0)switch(V.length){case 2:r.vertexAttrib2fv(W.location,V);break;case 3:r.vertexAttrib3fv(W.location,V);break;case 4:r.vertexAttrib4fv(W.location,V);break;default:r.vertexAttrib1fv(W.location,V)}}}}v()})(S,E,x,I),M!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(M).buffer))},reset:B,resetDefaultState:T,dispose:function(){B();for(const S in o){const E=o[S];for(const x in E){const I=E[x];for(const M in I)h(I[M].object),delete I[M];delete E[x]}delete o[S]}},releaseStatesOfGeometry:function(S){if(o[S.id]===void 0)return;const E=o[S.id];for(const x in E){const I=E[x];for(const M in I)h(I[M].object),delete I[M];delete E[x]}delete o[S.id]},releaseStatesOfProgram:function(S){for(const E in o){const x=o[E];if(x[S.id]===void 0)continue;const I=x[S.id];for(const M in I)h(I[M].object),delete I[M];delete x[S.id]}},initAttributes:g,enableAttribute:m,disableUnusedAttributes:v}}function bu(r,A,e,t){const n=t.isWebGL2;let i;this.setMode=function(a){i=a},this.render=function(a,o){r.drawArrays(i,a,o),e.update(o,i,1)},this.renderInstances=function(a,o,s){if(s===0)return;let l,c;if(n)l=r,c="drawArraysInstanced";else if(l=A.get("ANGLE_instanced_arrays"),c="drawArraysInstancedANGLE",l===null)return void console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");l[c](i,a,o,s),e.update(o,i,s)},this.renderMultiDraw=function(a,o,s){if(s===0)return;const l=A.get("WEBGL_multi_draw");if(l===null)for(let c=0;c<s;c++)this.render(a[c],o[c]);else{l.multiDrawArraysWEBGL(i,a,0,o,0,s);let c=0;for(let u=0;u<s;u++)c+=o[u];e.update(c,i,1)}}}function Iu(r,A,e){let t;function n(T){if(T==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const i=typeof WebGL2RenderingContext<"u"&&r.constructor.name==="WebGL2RenderingContext";let a=e.precision!==void 0?e.precision:"highp";const o=n(a);o!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",o,"instead."),a=o);const s=i||A.has("WEBGL_draw_buffers"),l=e.logarithmicDepthBuffer===!0,c=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),u=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=r.getParameter(r.MAX_TEXTURE_SIZE),d=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),g=r.getParameter(r.MAX_VERTEX_ATTRIBS),m=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),f=r.getParameter(r.MAX_VARYING_VECTORS),v=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),p=u>0,B=i||A.has("OES_texture_float");return{isWebGL2:i,drawBuffers:s,getMaxAnisotropy:function(){if(t!==void 0)return t;if(A.has("EXT_texture_filter_anisotropic")===!0){const T=A.get("EXT_texture_filter_anisotropic");t=r.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else t=0;return t},getMaxPrecision:n,precision:a,logarithmicDepthBuffer:l,maxTextures:c,maxVertexTextures:u,maxTextureSize:h,maxCubemapSize:d,maxAttributes:g,maxVertexUniforms:m,maxVaryings:f,maxFragmentUniforms:v,vertexTextures:p,floatFragmentTextures:B,floatVertexTextures:p&&B,maxSamples:i?r.getParameter(r.MAX_SAMPLES):0}}function Lu(r){const A=this;let e=null,t=0,n=!1,i=!1;const a=new bt,o=new UA,s={value:null,needsUpdate:!1};function l(c,u,h,d){const g=c!==null?c.length:0;let m=null;if(g!==0){if(m=s.value,d!==!0||m===null){const f=h+4*g,v=u.matrixWorldInverse;o.getNormalMatrix(v),(m===null||m.length<f)&&(m=new Float32Array(f));for(let p=0,B=h;p!==g;++p,B+=4)a.copy(c[p]).applyMatrix4(v,o),a.normal.toArray(m,B),m[B+3]=a.constant}s.value=m,s.needsUpdate=!0}return A.numPlanes=g,A.numIntersection=0,m}this.uniform=s,this.numPlanes=0,this.numIntersection=0,this.init=function(c,u){const h=c.length!==0||u||t!==0||n;return n=u,t=c.length,h},this.beginShadows=function(){i=!0,l(null)},this.endShadows=function(){i=!1},this.setGlobalState=function(c,u){e=l(c,u,0)},this.setState=function(c,u,h){const d=c.clippingPlanes,g=c.clipIntersection,m=c.clipShadows,f=r.get(c);if(!n||d===null||d.length===0||i&&!m)i?l(null):(function(){s.value!==e&&(s.value=e,s.needsUpdate=t>0),A.numPlanes=t,A.numIntersection=0})();else{const v=i?0:t,p=4*v;let B=f.clippingState||null;s.value=B,B=l(d,u,p,h);for(let T=0;T!==p;++T)B[T]=e[T];f.clippingState=B,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=v}}}function Ru(r){let A=new WeakMap;function e(n,i){return i===303?n.mapping=301:i===304&&(n.mapping=302),n}function t(n){const i=n.target;i.removeEventListener("dispose",t);const a=A.get(i);a!==void 0&&(A.delete(i),a.dispose())}return{get:function(n){if(n&&n.isTexture){const i=n.mapping;if(i===303||i===304){if(A.has(n))return e(A.get(n).texture,n.mapping);{const a=n.image;if(a&&a.height>0){const o=new yu(a.height/2);return o.fromEquirectangularTexture(r,n),A.set(n,o),n.addEventListener("dispose",t),e(o.texture,n.mapping)}return null}}}return n},dispose:function(){A=new WeakMap}}}class os extends ss{constructor(A=-1,e=1,t=1,n=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=A,this.right=e,this.top=t,this.bottom=n,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(A,e){return super.copy(A,e),this.left=A.left,this.right=A.right,this.top=A.top,this.bottom=A.bottom,this.near=A.near,this.far=A.far,this.zoom=A.zoom,this.view=A.view===null?null:Object.assign({},A.view),this}setViewOffset(A,e,t,n,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=A,this.view.fullHeight=e,this.view.offsetX=t,this.view.offsetY=n,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const A=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),t=(this.right+this.left)/2,n=(this.top+this.bottom)/2;let i=t-A,a=t+A,o=n+e,s=n-e;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=l*this.view.offsetX,a=i+l*this.view.width,o-=c*this.view.offsetY,s=o-c*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(A){const e=super.toJSON(A);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const js=[.125,.215,.35,.446,.526,.582],Fr=20,ia=new os,$s=new RA;let aa=null,sa=0,oa=0;const It=(1+Math.sqrt(5))/2,rr=1/It,Ao=[new Q(1,1,1),new Q(-1,1,1),new Q(1,1,-1),new Q(-1,1,-1),new Q(0,It,rr),new Q(0,It,-rr),new Q(rr,0,It),new Q(-rr,0,It),new Q(It,rr,0),new Q(-It,rr,0)];class eo{constructor(A){this._renderer=A,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(A,e=0,t=.1,n=100){aa=this._renderer.getRenderTarget(),sa=this._renderer.getActiveCubeFace(),oa=this._renderer.getActiveMipmapLevel(),this._setSize(256);const i=this._allocateTargets();return i.depthBuffer=!0,this._sceneToCubeUV(A,t,n,i),e>0&&this._blur(i,0,0,e),this._applyPMREM(i),this._cleanup(i),i}fromEquirectangular(A,e=null){return this._fromTexture(A,e)}fromCubemap(A,e=null){return this._fromTexture(A,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=no(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ro(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(A){this._lodMax=Math.floor(Math.log2(A)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let A=0;A<this._lodPlanes.length;A++)this._lodPlanes[A].dispose()}_cleanup(A){this._renderer.setRenderTarget(aa,sa,oa),A.scissorTest=!1,Qn(A,0,0,A.width,A.height)}_fromTexture(A,e){A.mapping===301||A.mapping===302?this._setSize(A.image.length===0?16:A.image[0].width||A.image[0].image.width):this._setSize(A.image.width/4),aa=this._renderer.getRenderTarget(),sa=this._renderer.getActiveCubeFace(),oa=this._renderer.getActiveMipmapLevel();const t=e||this._allocateTargets();return this._textureToCubeUV(A,t),this._applyPMREM(t),this._cleanup(t),t}_allocateTargets(){const A=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,t={magFilter:1006,minFilter:1006,generateMipmaps:!1,type:1016,format:1023,colorSpace:it,depthBuffer:!1},n=to(A,e,t);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==A||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=to(A,e,t);const{_lodMax:i}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=(function(a){const o=[],s=[],l=[];let c=a;const u=a-4+1+js.length;for(let h=0;h<u;h++){const d=Math.pow(2,c);s.push(d);let g=1/d;h>a-4?g=js[h-a+4-1]:h===0&&(g=0),l.push(g);const m=1/(d-2),f=-m,v=1+m,p=[f,f,v,f,v,v,f,f,v,v,f,v],B=6,T=6,S=3,E=2,x=1,I=new Float32Array(S*T*B),M=new Float32Array(E*T*B),L=new Float32Array(x*T*B);for(let y=0;y<B;y++){const H=y%3*2/3-1,D=y>2?0:-1,AA=[H,D,0,H+2/3,D,0,H+2/3,D+1,0,H,D,0,H+2/3,D+1,0,H,D+1,0];I.set(AA,S*T*y),M.set(p,E*T*y);const iA=[y,y,y,y,y,y];L.set(iA,x*T*y)}const j=new Gt;j.setAttribute("position",new Xe(I,S)),j.setAttribute("uv",new Xe(M,E)),j.setAttribute("faceIndex",new Xe(L,x)),o.push(j),c>4&&c--}return{lodPlanes:o,sizeLods:s,sigmas:l}})(i)),this._blurMaterial=(function(a,o,s){const l=new Float32Array(Fr),c=new Q(0,1,0);return new Nt({name:"SphericalGaussianBlur",defines:{n:Fr,CUBEUV_TEXEL_WIDTH:1/o,CUBEUV_TEXEL_HEIGHT:1/s,CUBEUV_MAX_MIP:`${a}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:l},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:c}},vertexShader:ls(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})})(i,A,e)}return n}_compileMaterial(A){const e=new be(this._lodPlanes[0],A);this._renderer.compile(e,ia)}_sceneToCubeUV(A,e,t,n){const i=new Ve(90,1,e,t),a=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],s=this._renderer,l=s.autoClear,c=s.toneMapping;s.getClearColor($s),s.toneMapping=0,s.autoClear=!1;const u=new Il({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),h=new be(new An,u);let d=!1;const g=A.background;g?g.isColor&&(u.color.copy(g),A.background=null,d=!0):(u.color.copy($s),d=!0);for(let m=0;m<6;m++){const f=m%3;f===0?(i.up.set(0,a[m],0),i.lookAt(o[m],0,0)):f===1?(i.up.set(0,0,a[m]),i.lookAt(0,o[m],0)):(i.up.set(0,a[m],0),i.lookAt(0,0,o[m]));const v=this._cubeSize;Qn(n,f*v,m>2?v:0,v,v),s.setRenderTarget(n),d&&s.render(h,i),s.render(A,i)}h.geometry.dispose(),h.material.dispose(),s.toneMapping=c,s.autoClear=l,A.background=g}_textureToCubeUV(A,e){const t=this._renderer,n=A.mapping===301||A.mapping===302;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=no()),this._cubemapMaterial.uniforms.flipEnvMap.value=A.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ro());const i=n?this._cubemapMaterial:this._equirectMaterial,a=new be(this._lodPlanes[0],i);i.uniforms.envMap.value=A;const o=this._cubeSize;Qn(e,0,0,3*o,2*o),t.setRenderTarget(e),t.render(a,ia)}_applyPMREM(A){const e=this._renderer,t=e.autoClear;e.autoClear=!1;for(let n=1;n<this._lodPlanes.length;n++){const i=Math.sqrt(this._sigmas[n]*this._sigmas[n]-this._sigmas[n-1]*this._sigmas[n-1]),a=Ao[(n-1)%Ao.length];this._blur(A,n-1,n,i,a)}e.autoClear=t}_blur(A,e,t,n,i){const a=this._pingPongRenderTarget;this._halfBlur(A,a,e,t,n,"latitudinal",i),this._halfBlur(a,A,t,t,n,"longitudinal",i)}_halfBlur(A,e,t,n,i,a,o){const s=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const c=new be(this._lodPlanes[n],l),u=l.uniforms,h=this._sizeLods[t]-1,d=isFinite(i)?Math.PI/(2*h):2*Math.PI/39,g=i/d,m=isFinite(i)?1+Math.floor(3*g):Fr;m>Fr&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to 20`);const f=[];let v=0;for(let T=0;T<Fr;++T){const S=T/g,E=Math.exp(-S*S/2);f.push(E),T===0?v+=E:T<m&&(v+=2*E)}for(let T=0;T<f.length;T++)f[T]=f[T]/v;u.envMap.value=A.texture,u.samples.value=m,u.weights.value=f,u.latitudinal.value=a==="latitudinal",o&&(u.poleAxis.value=o);const{_lodMax:p}=this;u.dTheta.value=d,u.mipInt.value=p-t;const B=this._sizeLods[n];Qn(e,3*B*(n>p-4?n-p+4:0),4*(this._cubeSize-B),3*B,2*B),s.setRenderTarget(e),s.render(c,ia)}}function to(r,A,e){const t=new Ot(r,A,e);return t.texture.mapping=306,t.texture.name="PMREM.cubeUv",t.scissorTest=!0,t}function Qn(r,A,e,t,n){r.viewport.set(A,e,t,n),r.scissor.set(A,e,t,n)}function ro(){return new Nt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ls(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function no(){return new Nt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ls(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ls(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Hu(r){let A=new WeakMap,e=null;function t(n){const i=n.target;i.removeEventListener("dispose",t);const a=A.get(i);a!==void 0&&(A.delete(i),a.dispose())}return{get:function(n){if(n&&n.isTexture){const i=n.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){if(n.isRenderTargetTexture&&n.needsPMREMUpdate===!0){n.needsPMREMUpdate=!1;let s=A.get(n);return e===null&&(e=new eo(r)),s=a?e.fromEquirectangular(n,s):e.fromCubemap(n,s),A.set(n,s),s.texture}if(A.has(n))return A.get(n).texture;{const s=n.image;if(a&&s&&s.height>0||o&&s&&(function(l){let c=0;const u=6;for(let h=0;h<u;h++)l[h]!==void 0&&c++;return c===u})(s)){e===null&&(e=new eo(r));const l=a?e.fromEquirectangular(n):e.fromCubemap(n);return A.set(n,l),n.addEventListener("dispose",t),l.texture}return null}}}return n},dispose:function(){A=new WeakMap,e!==null&&(e.dispose(),e=null)}}}function Du(r){const A={};function e(t){if(A[t]!==void 0)return A[t];let n;switch(t){case"WEBGL_depth_texture":n=r.getExtension("WEBGL_depth_texture")||r.getExtension("MOZ_WEBGL_depth_texture")||r.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":n=r.getExtension("EXT_texture_filter_anisotropic")||r.getExtension("MOZ_EXT_texture_filter_anisotropic")||r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":n=r.getExtension("WEBGL_compressed_texture_s3tc")||r.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":n=r.getExtension("WEBGL_compressed_texture_pvrtc")||r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:n=r.getExtension(t)}return A[t]=n,n}return{has:function(t){return e(t)!==null},init:function(t){t.isWebGL2?(e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance")):(e("WEBGL_depth_texture"),e("OES_texture_float"),e("OES_texture_half_float"),e("OES_texture_half_float_linear"),e("OES_standard_derivatives"),e("OES_element_index_uint"),e("OES_vertex_array_object"),e("ANGLE_instanced_arrays")),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture")},get:function(t){const n=e(t);return n===null&&console.warn("THREE.WebGLRenderer: "+t+" extension not supported."),n}}}function Pu(r,A,e,t){const n={},i=new WeakMap;function a(s){const l=s.target;l.index!==null&&A.remove(l.index);for(const u in l.attributes)A.remove(l.attributes[u]);for(const u in l.morphAttributes){const h=l.morphAttributes[u];for(let d=0,g=h.length;d<g;d++)A.remove(h[d])}l.removeEventListener("dispose",a),delete n[l.id];const c=i.get(l);c&&(A.remove(c),i.delete(l)),t.releaseStatesOfGeometry(l),l.isInstancedBufferGeometry===!0&&delete l._maxInstanceCount,e.memory.geometries--}function o(s){const l=[],c=s.index,u=s.attributes.position;let h=0;if(c!==null){const m=c.array;h=c.version;for(let f=0,v=m.length;f<v;f+=3){const p=m[f+0],B=m[f+1],T=m[f+2];l.push(p,B,B,T,T,p)}}else{if(u===void 0)return;{const m=u.array;h=u.version;for(let f=0,v=m.length/3-1;f<v;f+=3){const p=f+0,B=f+1,T=f+2;l.push(p,B,B,T,T,p)}}}const d=new(Ml(l)?Rl:Ll)(l,1);d.version=h;const g=i.get(s);g&&A.remove(g),i.set(s,d)}return{get:function(s,l){return n[l.id]===!0||(l.addEventListener("dispose",a),n[l.id]=!0,e.memory.geometries++),l},update:function(s){const l=s.attributes;for(const u in l)A.update(l[u],r.ARRAY_BUFFER);const c=s.morphAttributes;for(const u in c){const h=c[u];for(let d=0,g=h.length;d<g;d++)A.update(h[d],r.ARRAY_BUFFER)}},getWireframeAttribute:function(s){const l=i.get(s);if(l){const c=s.index;c!==null&&l.version<c.version&&o(s)}else o(s);return i.get(s)}}}function Ou(r,A,e,t){const n=t.isWebGL2;let i,a,o;this.setMode=function(s){i=s},this.setIndex=function(s){a=s.type,o=s.bytesPerElement},this.render=function(s,l){r.drawElements(i,l,a,s*o),e.update(l,i,1)},this.renderInstances=function(s,l,c){if(c===0)return;let u,h;if(n)u=r,h="drawElementsInstanced";else if(u=A.get("ANGLE_instanced_arrays"),h="drawElementsInstancedANGLE",u===null)return void console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");u[h](i,l,a,s*o,c),e.update(l,i,c)},this.renderMultiDraw=function(s,l,c){if(c===0)return;const u=A.get("WEBGL_multi_draw");if(u===null)for(let h=0;h<c;h++)this.render(s[h]/o,l[h]);else{u.multiDrawElementsWEBGL(i,l,0,a,s,0,c);let h=0;for(let d=0;d<c;d++)h+=l[d];e.update(h,i,1)}}}function Nu(r){const A={frame:0,calls:0,triangles:0,points:0,lines:0};return{memory:{geometries:0,textures:0},render:A,programs:null,autoReset:!0,reset:function(){A.calls=0,A.triangles=0,A.points=0,A.lines=0},update:function(e,t,n){switch(A.calls++,t){case r.TRIANGLES:A.triangles+=n*(e/3);break;case r.LINES:A.lines+=n*(e/2);break;case r.LINE_STRIP:A.lines+=n*(e-1);break;case r.LINE_LOOP:A.lines+=n*e;break;case r.POINTS:A.points+=n*e;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",t)}}}}function Gu(r,A){return r[0]-A[0]}function Vu(r,A){return Math.abs(A[1])-Math.abs(r[1])}function Ku(r,A,e){const t={},n=new Float32Array(8),i=new WeakMap,a=new ZA,o=[];for(let s=0;s<8;s++)o[s]=[s,0];return{update:function(s,l,c){const u=s.morphTargetInfluences;if(A.isWebGL2===!0){const h=l.morphAttributes.position||l.morphAttributes.normal||l.morphAttributes.color,d=h!==void 0?h.length:0;let g=i.get(l);if(g===void 0||g.count!==d){let H=function(){j.dispose(),i.delete(l),l.removeEventListener("dispose",H)};g!==void 0&&g.texture.dispose();const v=l.morphAttributes.position!==void 0,p=l.morphAttributes.normal!==void 0,B=l.morphAttributes.color!==void 0,T=l.morphAttributes.position||[],S=l.morphAttributes.normal||[],E=l.morphAttributes.color||[];let x=0;v===!0&&(x=1),p===!0&&(x=2),B===!0&&(x=3);let I=l.attributes.position.count*x,M=1;I>A.maxTextureSize&&(M=Math.ceil(I/A.maxTextureSize),I=A.maxTextureSize);const L=new Float32Array(I*M*4*d),j=new Tl(L,I,M,d);j.type=1015,j.needsUpdate=!0;const y=4*x;for(let D=0;D<d;D++){const AA=T[D],iA=S[D],k=E[D],G=I*M*4*D;for(let W=0;W<AA.count;W++){const R=W*y;v===!0&&(a.fromBufferAttribute(AA,W),L[G+R+0]=a.x,L[G+R+1]=a.y,L[G+R+2]=a.z,L[G+R+3]=0),p===!0&&(a.fromBufferAttribute(iA,W),L[G+R+4]=a.x,L[G+R+5]=a.y,L[G+R+6]=a.z,L[G+R+7]=0),B===!0&&(a.fromBufferAttribute(k,W),L[G+R+8]=a.x,L[G+R+9]=a.y,L[G+R+10]=a.z,L[G+R+11]=k.itemSize===4?a.w:1)}}g={count:d,texture:j,size:new TA(I,M)},i.set(l,g),l.addEventListener("dispose",H)}let m=0;for(let v=0;v<u.length;v++)m+=u[v];const f=l.morphTargetsRelative?1:1-m;c.getUniforms().setValue(r,"morphTargetBaseInfluence",f),c.getUniforms().setValue(r,"morphTargetInfluences",u),c.getUniforms().setValue(r,"morphTargetsTexture",g.texture,e),c.getUniforms().setValue(r,"morphTargetsTextureSize",g.size)}else{const h=u===void 0?0:u.length;let d=t[l.id];if(d===void 0||d.length!==h){d=[];for(let p=0;p<h;p++)d[p]=[p,0];t[l.id]=d}for(let p=0;p<h;p++){const B=d[p];B[0]=p,B[1]=u[p]}d.sort(Vu);for(let p=0;p<8;p++)p<h&&d[p][1]?(o[p][0]=d[p][0],o[p][1]=d[p][1]):(o[p][0]=Number.MAX_SAFE_INTEGER,o[p][1]=0);o.sort(Gu);const g=l.morphAttributes.position,m=l.morphAttributes.normal;let f=0;for(let p=0;p<8;p++){const B=o[p],T=B[0],S=B[1];T!==Number.MAX_SAFE_INTEGER&&S?(g&&l.getAttribute("morphTarget"+p)!==g[T]&&l.setAttribute("morphTarget"+p,g[T]),m&&l.getAttribute("morphNormal"+p)!==m[T]&&l.setAttribute("morphNormal"+p,m[T]),n[p]=S,f+=S):(g&&l.hasAttribute("morphTarget"+p)===!0&&l.deleteAttribute("morphTarget"+p),m&&l.hasAttribute("morphNormal"+p)===!0&&l.deleteAttribute("morphNormal"+p),n[p]=0)}const v=l.morphTargetsRelative?1:1-f;c.getUniforms().setValue(r,"morphTargetBaseInfluence",v),c.getUniforms().setValue(r,"morphTargetInfluences",n)}}}}function ku(r,A,e,t){let n=new WeakMap;function i(a){const o=a.target;o.removeEventListener("dispose",i),e.remove(o.instanceMatrix),o.instanceColor!==null&&e.remove(o.instanceColor)}return{update:function(a){const o=t.render.frame,s=a.geometry,l=A.get(a,s);if(n.get(l)!==o&&(A.update(l),n.set(l,o)),a.isInstancedMesh&&(a.hasEventListener("dispose",i)===!1&&a.addEventListener("dispose",i),n.get(a)!==o&&(e.update(a.instanceMatrix,r.ARRAY_BUFFER),a.instanceColor!==null&&e.update(a.instanceColor,r.ARRAY_BUFFER),n.set(a,o))),a.isSkinnedMesh){const c=a.skeleton;n.get(c)!==o&&(c.update(),n.set(c,o))}return l},dispose:function(){n=new WeakMap}}}class Ol extends we{constructor(A,e,t,n,i,a,o,s,l,c){if((c=c!==void 0?c:1026)!==1026&&c!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");t===void 0&&c===1026&&(t=1014),t===void 0&&c===1027&&(t=1020),super(null,n,i,a,o,s,c,t,l),this.isDepthTexture=!0,this.image={width:A,height:e},this.magFilter=o!==void 0?o:1003,this.minFilter=s!==void 0?s:1003,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(A){return super.copy(A),this.compareFunction=A.compareFunction,this}toJSON(A){const e=super.toJSON(A);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Nl=new we,Gl=new Ol(1,1);Gl.compareFunction=515;const Vl=new Tl,Kl=new hu,kl=new Dl,io=[],ao=[],so=new Float32Array(16),oo=new Float32Array(9),lo=new Float32Array(4);function vr(r,A,e){const t=r[0];if(t<=0||t>0)return r;const n=A*e;let i=io[n];if(i===void 0&&(i=new Float32Array(n),io[n]=i),A!==0){t.toArray(i,0);for(let a=1,o=0;a!==A;++a)o+=e,r[a].toArray(i,o)}return i}function $A(r,A){if(r.length!==A.length)return!1;for(let e=0,t=r.length;e<t;e++)if(r[e]!==A[e])return!1;return!0}function Ae(r,A){for(let e=0,t=A.length;e<t;e++)r[e]=A[e]}function Ui(r,A){let e=ao[A];e===void 0&&(e=new Int32Array(A),ao[A]=e);for(let t=0;t!==A;++t)e[t]=r.allocateTextureUnit();return e}function zu(r,A){const e=this.cache;e[0]!==A&&(r.uniform1f(this.addr,A),e[0]=A)}function Wu(r,A){const e=this.cache;if(A.x!==void 0)e[0]===A.x&&e[1]===A.y||(r.uniform2f(this.addr,A.x,A.y),e[0]=A.x,e[1]=A.y);else{if($A(e,A))return;r.uniform2fv(this.addr,A),Ae(e,A)}}function Xu(r,A){const e=this.cache;if(A.x!==void 0)e[0]===A.x&&e[1]===A.y&&e[2]===A.z||(r.uniform3f(this.addr,A.x,A.y,A.z),e[0]=A.x,e[1]=A.y,e[2]=A.z);else if(A.r!==void 0)e[0]===A.r&&e[1]===A.g&&e[2]===A.b||(r.uniform3f(this.addr,A.r,A.g,A.b),e[0]=A.r,e[1]=A.g,e[2]=A.b);else{if($A(e,A))return;r.uniform3fv(this.addr,A),Ae(e,A)}}function Yu(r,A){const e=this.cache;if(A.x!==void 0)e[0]===A.x&&e[1]===A.y&&e[2]===A.z&&e[3]===A.w||(r.uniform4f(this.addr,A.x,A.y,A.z,A.w),e[0]=A.x,e[1]=A.y,e[2]=A.z,e[3]=A.w);else{if($A(e,A))return;r.uniform4fv(this.addr,A),Ae(e,A)}}function Ju(r,A){const e=this.cache,t=A.elements;if(t===void 0){if($A(e,A))return;r.uniformMatrix2fv(this.addr,!1,A),Ae(e,A)}else{if($A(e,t))return;lo.set(t),r.uniformMatrix2fv(this.addr,!1,lo),Ae(e,t)}}function Zu(r,A){const e=this.cache,t=A.elements;if(t===void 0){if($A(e,A))return;r.uniformMatrix3fv(this.addr,!1,A),Ae(e,A)}else{if($A(e,t))return;oo.set(t),r.uniformMatrix3fv(this.addr,!1,oo),Ae(e,t)}}function qu(r,A){const e=this.cache,t=A.elements;if(t===void 0){if($A(e,A))return;r.uniformMatrix4fv(this.addr,!1,A),Ae(e,A)}else{if($A(e,t))return;so.set(t),r.uniformMatrix4fv(this.addr,!1,so),Ae(e,t)}}function ju(r,A){const e=this.cache;e[0]!==A&&(r.uniform1i(this.addr,A),e[0]=A)}function $u(r,A){const e=this.cache;if(A.x!==void 0)e[0]===A.x&&e[1]===A.y||(r.uniform2i(this.addr,A.x,A.y),e[0]=A.x,e[1]=A.y);else{if($A(e,A))return;r.uniform2iv(this.addr,A),Ae(e,A)}}function Ah(r,A){const e=this.cache;if(A.x!==void 0)e[0]===A.x&&e[1]===A.y&&e[2]===A.z||(r.uniform3i(this.addr,A.x,A.y,A.z),e[0]=A.x,e[1]=A.y,e[2]=A.z);else{if($A(e,A))return;r.uniform3iv(this.addr,A),Ae(e,A)}}function eh(r,A){const e=this.cache;if(A.x!==void 0)e[0]===A.x&&e[1]===A.y&&e[2]===A.z&&e[3]===A.w||(r.uniform4i(this.addr,A.x,A.y,A.z,A.w),e[0]=A.x,e[1]=A.y,e[2]=A.z,e[3]=A.w);else{if($A(e,A))return;r.uniform4iv(this.addr,A),Ae(e,A)}}function th(r,A){const e=this.cache;e[0]!==A&&(r.uniform1ui(this.addr,A),e[0]=A)}function rh(r,A){const e=this.cache;if(A.x!==void 0)e[0]===A.x&&e[1]===A.y||(r.uniform2ui(this.addr,A.x,A.y),e[0]=A.x,e[1]=A.y);else{if($A(e,A))return;r.uniform2uiv(this.addr,A),Ae(e,A)}}function nh(r,A){const e=this.cache;if(A.x!==void 0)e[0]===A.x&&e[1]===A.y&&e[2]===A.z||(r.uniform3ui(this.addr,A.x,A.y,A.z),e[0]=A.x,e[1]=A.y,e[2]=A.z);else{if($A(e,A))return;r.uniform3uiv(this.addr,A),Ae(e,A)}}function ih(r,A){const e=this.cache;if(A.x!==void 0)e[0]===A.x&&e[1]===A.y&&e[2]===A.z&&e[3]===A.w||(r.uniform4ui(this.addr,A.x,A.y,A.z,A.w),e[0]=A.x,e[1]=A.y,e[2]=A.z,e[3]=A.w);else{if($A(e,A))return;r.uniform4uiv(this.addr,A),Ae(e,A)}}function ah(r,A,e){const t=this.cache,n=e.allocateTextureUnit();t[0]!==n&&(r.uniform1i(this.addr,n),t[0]=n);const i=this.type===r.SAMPLER_2D_SHADOW?Gl:Nl;e.setTexture2D(A||i,n)}function sh(r,A,e){const t=this.cache,n=e.allocateTextureUnit();t[0]!==n&&(r.uniform1i(this.addr,n),t[0]=n),e.setTexture3D(A||Kl,n)}function oh(r,A,e){const t=this.cache,n=e.allocateTextureUnit();t[0]!==n&&(r.uniform1i(this.addr,n),t[0]=n),e.setTextureCube(A||kl,n)}function lh(r,A,e){const t=this.cache,n=e.allocateTextureUnit();t[0]!==n&&(r.uniform1i(this.addr,n),t[0]=n),e.setTexture2DArray(A||Vl,n)}function ch(r,A){r.uniform1fv(this.addr,A)}function uh(r,A){const e=vr(A,this.size,2);r.uniform2fv(this.addr,e)}function hh(r,A){const e=vr(A,this.size,3);r.uniform3fv(this.addr,e)}function dh(r,A){const e=vr(A,this.size,4);r.uniform4fv(this.addr,e)}function fh(r,A){const e=vr(A,this.size,4);r.uniformMatrix2fv(this.addr,!1,e)}function ph(r,A){const e=vr(A,this.size,9);r.uniformMatrix3fv(this.addr,!1,e)}function gh(r,A){const e=vr(A,this.size,16);r.uniformMatrix4fv(this.addr,!1,e)}function mh(r,A){r.uniform1iv(this.addr,A)}function Bh(r,A){r.uniform2iv(this.addr,A)}function vh(r,A){r.uniform3iv(this.addr,A)}function wh(r,A){r.uniform4iv(this.addr,A)}function _h(r,A){r.uniform1uiv(this.addr,A)}function Ch(r,A){r.uniform2uiv(this.addr,A)}function Eh(r,A){r.uniform3uiv(this.addr,A)}function Uh(r,A){r.uniform4uiv(this.addr,A)}function xh(r,A,e){const t=this.cache,n=A.length,i=Ui(e,n);$A(t,i)||(r.uniform1iv(this.addr,i),Ae(t,i));for(let a=0;a!==n;++a)e.setTexture2D(A[a]||Nl,i[a])}function yh(r,A,e){const t=this.cache,n=A.length,i=Ui(e,n);$A(t,i)||(r.uniform1iv(this.addr,i),Ae(t,i));for(let a=0;a!==n;++a)e.setTexture3D(A[a]||Kl,i[a])}function Mh(r,A,e){const t=this.cache,n=A.length,i=Ui(e,n);$A(t,i)||(r.uniform1iv(this.addr,i),Ae(t,i));for(let a=0;a!==n;++a)e.setTextureCube(A[a]||kl,i[a])}function Sh(r,A,e){const t=this.cache,n=A.length,i=Ui(e,n);$A(t,i)||(r.uniform1iv(this.addr,i),Ae(t,i));for(let a=0;a!==n;++a)e.setTexture2DArray(A[a]||Vl,i[a])}class Fh{constructor(A,e,t){this.id=A,this.addr=t,this.cache=[],this.type=e.type,this.setValue=(function(n){switch(n){case 5126:return zu;case 35664:return Wu;case 35665:return Xu;case 35666:return Yu;case 35674:return Ju;case 35675:return Zu;case 35676:return qu;case 5124:case 35670:return ju;case 35667:case 35671:return $u;case 35668:case 35672:return Ah;case 35669:case 35673:return eh;case 5125:return th;case 36294:return rh;case 36295:return nh;case 36296:return ih;case 35678:case 36198:case 36298:case 36306:case 35682:return ah;case 35679:case 36299:case 36307:return sh;case 35680:case 36300:case 36308:case 36293:return oh;case 36289:case 36303:case 36311:case 36292:return lh}})(e.type)}}class Th{constructor(A,e,t){this.id=A,this.addr=t,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=(function(n){switch(n){case 5126:return ch;case 35664:return uh;case 35665:return hh;case 35666:return dh;case 35674:return fh;case 35675:return ph;case 35676:return gh;case 5124:case 35670:return mh;case 35667:case 35671:return Bh;case 35668:case 35672:return vh;case 35669:case 35673:return wh;case 5125:return _h;case 36294:return Ch;case 36295:return Eh;case 36296:return Uh;case 35678:case 36198:case 36298:case 36306:case 35682:return xh;case 35679:case 36299:case 36307:return yh;case 35680:case 36300:case 36308:case 36293:return Mh;case 36289:case 36303:case 36311:case 36292:return Sh}})(e.type)}}class Qh{constructor(A){this.id=A,this.seq=[],this.map={}}setValue(A,e,t){const n=this.seq;for(let i=0,a=n.length;i!==a;++i){const o=n[i];o.setValue(A,e[o.id],t)}}}const la=/(\w+)(\])?(\[|\.)?/g;function co(r,A){r.seq.push(A),r.map[A.id]=A}function bh(r,A,e){const t=r.name,n=t.length;for(la.lastIndex=0;;){const i=la.exec(t),a=la.lastIndex;let o=i[1];const s=i[2]==="]",l=i[3];if(s&&(o|=0),l===void 0||l==="["&&a+2===n){co(e,l===void 0?new Fh(o,r,A):new Th(o,r,A));break}{let c=e.map[o];c===void 0&&(c=new Qh(o),co(e,c)),e=c}}}class ei{constructor(A,e){this.seq=[],this.map={};const t=A.getProgramParameter(e,A.ACTIVE_UNIFORMS);for(let n=0;n<t;++n){const i=A.getActiveUniform(e,n);bh(i,A.getUniformLocation(e,i.name),this)}}setValue(A,e,t,n){const i=this.map[e];i!==void 0&&i.setValue(A,t,n)}setOptional(A,e,t){const n=e[t];n!==void 0&&this.setValue(A,t,n)}static upload(A,e,t,n){for(let i=0,a=e.length;i!==a;++i){const o=e[i],s=t[o.id];s.needsUpdate!==!1&&o.setValue(A,s.value,n)}}static seqWithValue(A,e){const t=[];for(let n=0,i=A.length;n!==i;++n){const a=A[n];a.id in e&&t.push(a)}return t}}function uo(r,A,e){const t=r.createShader(A);return r.shaderSource(t,e),r.compileShader(t),t}const Ih=37297;let Lh=0;function ho(r,A,e){const t=r.getShaderParameter(A,r.COMPILE_STATUS),n=r.getShaderInfoLog(A).trim();if(t&&n==="")return"";const i=/ERROR: 0:(\d+)/.exec(n);if(i){const a=parseInt(i[1]);return e.toUpperCase()+`

`+n+`

`+(function(o,s){const l=o.split(`
`),c=[],u=Math.max(s-6,0),h=Math.min(s+6,l.length);for(let d=u;d<h;d++){const g=d+1;c.push(`${g===s?">":" "} ${g}: ${l[d]}`)}return c.join(`
`)})(r.getShaderSource(A),a)}return n}function Rh(r,A){const e=(function(t){const n=PA.getPrimaries(PA.workingColorSpace),i=PA.getPrimaries(t);let a;switch(n===i?a="":n==="p3"&&i===si?a="LinearDisplayP3ToLinearSRGB":n===si&&i==="p3"&&(a="LinearSRGBToLinearDisplayP3"),t){case it:case vi:return[a,"LinearTransferOETF"];case YA:case as:return[a,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",t),[a,"LinearTransferOETF"]}})(A);return`vec4 ${r}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function Hh(r,A){let e;switch(A){case 1:e="Linear";break;case 2:e="Reinhard";break;case 3:e="OptimizedCineon";break;case 4:e="ACESFilmic";break;case 6:e="AgX";break;case 5:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",A),e="Linear"}return"vec3 "+r+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}function nr(r){return r!==""}function fo(r,A){const e=A.numSpotLightShadows+A.numSpotLightMaps-A.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,A.numDirLights).replace(/NUM_SPOT_LIGHTS/g,A.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,A.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,A.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,A.numPointLights).replace(/NUM_HEMI_LIGHTS/g,A.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,A.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,A.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,A.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,A.numPointLightShadows)}function po(r,A){return r.replace(/NUM_CLIPPING_PLANES/g,A.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,A.numClippingPlanes-A.numClipIntersection)}const Dh=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ha(r){return r.replace(Dh,Oh)}const Ph=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Oh(r,A){let e=_A[A];if(e===void 0){const t=Ph.get(A);if(t===void 0)throw new Error("Can not resolve #include <"+A+">");e=_A[t],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',A,t)}return Ha(e)}const Nh=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function go(r){return r.replace(Nh,Gh)}function Gh(r,A,e,t){let n="";for(let i=parseInt(A);i<parseInt(e);i++)n+=t.replace(/\[\s*i\s*\]/g,"[ "+i+" ]").replace(/UNROLLED_LOOP_INDEX/g,i);return n}function mo(r){let A="precision "+r.precision+` float;
precision `+r.precision+" int;";return r.precision==="highp"?A+=`
#define HIGH_PRECISION`:r.precision==="mediump"?A+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(A+=`
#define LOW_PRECISION`),A}function Vh(r,A,e,t){const n=r.getContext(),i=e.defines;let a=e.vertexShader,o=e.fragmentShader;const s=(function(y){let H="SHADOWMAP_TYPE_BASIC";return y.shadowMapType===1?H="SHADOWMAP_TYPE_PCF":y.shadowMapType===2?H="SHADOWMAP_TYPE_PCF_SOFT":y.shadowMapType===3&&(H="SHADOWMAP_TYPE_VSM"),H})(e),l=(function(y){let H="ENVMAP_TYPE_CUBE";if(y.envMap)switch(y.envMapMode){case 301:case 302:H="ENVMAP_TYPE_CUBE";break;case 306:H="ENVMAP_TYPE_CUBE_UV"}return H})(e),c=(function(y){let H="ENVMAP_MODE_REFLECTION";return y.envMap&&y.envMapMode===302&&(H="ENVMAP_MODE_REFRACTION"),H})(e),u=(function(y){let H="ENVMAP_BLENDING_NONE";if(y.envMap)switch(y.combine){case 0:H="ENVMAP_BLENDING_MULTIPLY";break;case 1:H="ENVMAP_BLENDING_MIX";break;case 2:H="ENVMAP_BLENDING_ADD"}return H})(e),h=(function(y){const H=y.envMapCubeUVHeight;if(H===null)return null;const D=Math.log2(H)-2,AA=1/H;return{texelWidth:1/(3*Math.max(Math.pow(2,D),112)),texelHeight:AA,maxMip:D}})(e),d=e.isWebGL2?"":(function(y){return[y.extensionDerivatives||y.envMapCubeUVHeight||y.bumpMap||y.normalMapTangentSpace||y.clearcoatNormalMap||y.flatShading||y.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(y.extensionFragDepth||y.logarithmicDepthBuffer)&&y.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",y.extensionDrawBuffers&&y.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(y.extensionShaderTextureLOD||y.envMap||y.transmission)&&y.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(nr).join(`
`)})(e),g=(function(y){return[y.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(nr).join(`
`)})(e),m=(function(y){const H=[];for(const D in y){const AA=y[D];AA!==!1&&H.push("#define "+D+" "+AA)}return H.join(`
`)})(i),f=n.createProgram();let v,p,B=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(v=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(nr).join(`
`),v.length>0&&(v+=`
`),p=[d,"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(nr).join(`
`),p.length>0&&(p+=`
`)):(v=[mo(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors&&e.isWebGL2?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0&&e.isWebGL2?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+s:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(nr).join(`
`),p=[d,mo(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+s:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.useLegacyLights?"#define LEGACY_LIGHTS":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.logarithmicDepthBuffer&&e.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==0?"#define TONE_MAPPING":"",e.toneMapping!==0?_A.tonemapping_pars_fragment:"",e.toneMapping!==0?Hh("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",_A.colorspace_pars_fragment,Rh("linearToOutputTexel",e.outputColorSpace),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(nr).join(`
`)),a=Ha(a),a=fo(a,e),a=po(a,e),o=Ha(o),o=fo(o,e),o=po(o,e),a=go(a),o=go(o),e.isWebGL2&&e.isRawShaderMaterial!==!0&&(B=`#version 300 es
`,v=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,p=["precision mediump sampler2DArray;","#define varying in",e.glslVersion===Ls?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Ls?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const T=B+v+a,S=B+p+o,E=uo(n,n.VERTEX_SHADER,T),x=uo(n,n.FRAGMENT_SHADER,S);function I(y){if(r.debug.checkShaderErrors){const H=n.getProgramInfoLog(f).trim(),D=n.getShaderInfoLog(E).trim(),AA=n.getShaderInfoLog(x).trim();let iA=!0,k=!0;if(n.getProgramParameter(f,n.LINK_STATUS)===!1)if(iA=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(n,f,E,x);else{const G=ho(n,E,"vertex"),W=ho(n,x,"fragment");console.error("THREE.WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(f,n.VALIDATE_STATUS)+`

Program Info Log: `+H+`
`+G+`
`+W)}else H!==""?console.warn("THREE.WebGLProgram: Program Info Log:",H):D!==""&&AA!==""||(k=!1);k&&(y.diagnostics={runnable:iA,programLog:H,vertexShader:{log:D,prefix:v},fragmentShader:{log:AA,prefix:p}})}n.deleteShader(E),n.deleteShader(x),M=new ei(n,f),L=(function(H,D){const AA={},iA=H.getProgramParameter(D,H.ACTIVE_ATTRIBUTES);for(let k=0;k<iA;k++){const G=H.getActiveAttrib(D,k),W=G.name;let R=1;G.type===H.FLOAT_MAT2&&(R=2),G.type===H.FLOAT_MAT3&&(R=3),G.type===H.FLOAT_MAT4&&(R=4),AA[W]={type:G.type,location:H.getAttribLocation(D,W),locationSize:R}}return AA})(n,f)}let M,L;n.attachShader(f,E),n.attachShader(f,x),e.index0AttributeName!==void 0?n.bindAttribLocation(f,0,e.index0AttributeName):e.morphTargets===!0&&n.bindAttribLocation(f,0,"position"),n.linkProgram(f),this.getUniforms=function(){return M===void 0&&I(this),M},this.getAttributes=function(){return L===void 0&&I(this),L};let j=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return j===!1&&(j=n.getProgramParameter(f,Ih)),j},this.destroy=function(){t.releaseStatesOfProgram(this),n.deleteProgram(f),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Lh++,this.cacheKey=A,this.usedTimes=1,this.program=f,this.vertexShader=E,this.fragmentShader=x,this}let Kh=0;class kh{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(A){const e=A.vertexShader,t=A.fragmentShader,n=this._getShaderStage(e),i=this._getShaderStage(t),a=this._getShaderCacheForMaterial(A);return a.has(n)===!1&&(a.add(n),n.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(A){const e=this.materialCache.get(A);for(const t of e)t.usedTimes--,t.usedTimes===0&&this.shaderCache.delete(t.code);return this.materialCache.delete(A),this}getVertexShaderID(A){return this._getShaderStage(A.vertexShader).id}getFragmentShaderID(A){return this._getShaderStage(A.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(A){const e=this.materialCache;let t=e.get(A);return t===void 0&&(t=new Set,e.set(A,t)),t}_getShaderStage(A){const e=this.shaderCache;let t=e.get(A);return t===void 0&&(t=new zh(A),e.set(A,t)),t}}class zh{constructor(A){this.id=Kh++,this.code=A,this.usedTimes=0}}function Wh(r,A,e,t,n,i,a){const o=new Ql,s=new kh,l=[],c=n.isWebGL2,u=n.logarithmicDepthBuffer,h=n.vertexTextures;let d=n.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(f){return f===0?"uv":`uv${f}`}return{getParameters:function(f,v,p,B,T){const S=B.fog,E=T.geometry,x=f.isMeshStandardMaterial?B.environment:null,I=(f.isMeshStandardMaterial?e:A).get(f.envMap||x),M=I&&I.mapping===306?I.image.height:null,L=g[f.type];f.precision!==null&&(d=n.getMaxPrecision(f.precision),d!==f.precision&&console.warn("THREE.WebGLProgram.getParameters:",f.precision,"not supported, using",d,"instead."));const j=E.morphAttributes.position||E.morphAttributes.normal||E.morphAttributes.color,y=j!==void 0?j.length:0;let H,D,AA,iA,k=0;if(E.morphAttributes.position!==void 0&&(k=1),E.morphAttributes.normal!==void 0&&(k=2),E.morphAttributes.color!==void 0&&(k=3),L){const ie=We[L];H=ie.vertexShader,D=ie.fragmentShader}else H=f.vertexShader,D=f.fragmentShader,s.update(f),AA=s.getVertexShaderID(f),iA=s.getFragmentShaderID(f);const G=r.getRenderTarget(),W=T.isInstancedMesh===!0,R=T.isBatchedMesh===!0,V=!!f.map,rA=!!f.matcap,w=!!I,_=!!f.aoMap,b=!!f.lightMap,O=!!f.bumpMap,F=!!f.normalMap,X=!!f.displacementMap,Z=!!f.emissiveMap,q=!!f.metalnessMap,tA=!!f.roughnessMap,cA=f.anisotropy>0,dA=f.clearcoat>0,C=f.iridescence>0,aA=f.sheen>0,Y=f.transmission>0,K=cA&&!!f.anisotropyMap,eA=dA&&!!f.clearcoatMap,uA=dA&&!!f.clearcoatNormalMap,hA=dA&&!!f.clearcoatRoughnessMap,gA=C&&!!f.iridescenceMap,wA=C&&!!f.iridescenceThicknessMap,fA=aA&&!!f.sheenColorMap,pA=aA&&!!f.sheenRoughnessMap,yA=!!f.specularMap,he=!!f.specularColorMap,mA=!!f.specularIntensityMap,IA=Y&&!!f.transmissionMap,MA=Y&&!!f.thicknessMap,rn=!!f.gradientMap,Vt=!!f.alphaMap,nn=f.alphaTest>0,xe=!!f.alphaHash,_e=!!f.extensions,Kt=!!E.attributes.uv1,N=!!E.attributes.uv2,an=!!E.attributes.uv3;let _r=0;return f.toneMapped&&(G!==null&&G.isXRRenderTarget!==!0||(_r=r.toneMapping)),{isWebGL2:c,shaderID:L,shaderType:f.type,shaderName:f.name,vertexShader:H,fragmentShader:D,defines:f.defines,customVertexShaderID:AA,customFragmentShaderID:iA,isRawShaderMaterial:f.isRawShaderMaterial===!0,glslVersion:f.glslVersion,precision:d,batching:R,instancing:W,instancingColor:W&&T.instanceColor!==null,supportsVertexTextures:h,outputColorSpace:G===null?r.outputColorSpace:G.isXRRenderTarget===!0?G.texture.colorSpace:it,map:V,matcap:rA,envMap:w,envMapMode:w&&I.mapping,envMapCubeUVHeight:M,aoMap:_,lightMap:b,bumpMap:O,normalMap:F,displacementMap:h&&X,emissiveMap:Z,normalMapObjectSpace:F&&f.normalMapType===1,normalMapTangentSpace:F&&f.normalMapType===0,metalnessMap:q,roughnessMap:tA,anisotropy:cA,anisotropyMap:K,clearcoat:dA,clearcoatMap:eA,clearcoatNormalMap:uA,clearcoatRoughnessMap:hA,iridescence:C,iridescenceMap:gA,iridescenceThicknessMap:wA,sheen:aA,sheenColorMap:fA,sheenRoughnessMap:pA,specularMap:yA,specularColorMap:he,specularIntensityMap:mA,transmission:Y,transmissionMap:IA,thicknessMap:MA,gradientMap:rn,opaque:f.transparent===!1&&f.blending===1,alphaMap:Vt,alphaTest:nn,alphaHash:xe,combine:f.combine,mapUv:V&&m(f.map.channel),aoMapUv:_&&m(f.aoMap.channel),lightMapUv:b&&m(f.lightMap.channel),bumpMapUv:O&&m(f.bumpMap.channel),normalMapUv:F&&m(f.normalMap.channel),displacementMapUv:X&&m(f.displacementMap.channel),emissiveMapUv:Z&&m(f.emissiveMap.channel),metalnessMapUv:q&&m(f.metalnessMap.channel),roughnessMapUv:tA&&m(f.roughnessMap.channel),anisotropyMapUv:K&&m(f.anisotropyMap.channel),clearcoatMapUv:eA&&m(f.clearcoatMap.channel),clearcoatNormalMapUv:uA&&m(f.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:hA&&m(f.clearcoatRoughnessMap.channel),iridescenceMapUv:gA&&m(f.iridescenceMap.channel),iridescenceThicknessMapUv:wA&&m(f.iridescenceThicknessMap.channel),sheenColorMapUv:fA&&m(f.sheenColorMap.channel),sheenRoughnessMapUv:pA&&m(f.sheenRoughnessMap.channel),specularMapUv:yA&&m(f.specularMap.channel),specularColorMapUv:he&&m(f.specularColorMap.channel),specularIntensityMapUv:mA&&m(f.specularIntensityMap.channel),transmissionMapUv:IA&&m(f.transmissionMap.channel),thicknessMapUv:MA&&m(f.thicknessMap.channel),alphaMapUv:Vt&&m(f.alphaMap.channel),vertexTangents:!!E.attributes.tangent&&(F||cA),vertexColors:f.vertexColors,vertexAlphas:f.vertexColors===!0&&!!E.attributes.color&&E.attributes.color.itemSize===4,vertexUv1s:Kt,vertexUv2s:N,vertexUv3s:an,pointsUvs:T.isPoints===!0&&!!E.attributes.uv&&(V||Vt),fog:!!S,useFog:f.fog===!0,fogExp2:S&&S.isFogExp2,flatShading:f.flatShading===!0,sizeAttenuation:f.sizeAttenuation===!0,logarithmicDepthBuffer:u,skinning:T.isSkinnedMesh===!0,morphTargets:E.morphAttributes.position!==void 0,morphNormals:E.morphAttributes.normal!==void 0,morphColors:E.morphAttributes.color!==void 0,morphTargetsCount:y,morphTextureStride:k,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:f.dithering,shadowMapEnabled:r.shadowMap.enabled&&p.length>0,shadowMapType:r.shadowMap.type,toneMapping:_r,useLegacyLights:r._useLegacyLights,decodeVideoTexture:V&&f.map.isVideoTexture===!0&&PA.getTransfer(f.map.colorSpace)===GA,premultipliedAlpha:f.premultipliedAlpha,doubleSided:f.side===2,flipSided:f.side===1,useDepthPacking:f.depthPacking>=0,depthPacking:f.depthPacking||0,index0AttributeName:f.index0AttributeName,extensionDerivatives:_e&&f.extensions.derivatives===!0,extensionFragDepth:_e&&f.extensions.fragDepth===!0,extensionDrawBuffers:_e&&f.extensions.drawBuffers===!0,extensionShaderTextureLOD:_e&&f.extensions.shaderTextureLOD===!0,extensionClipCullDistance:_e&&f.extensions.clipCullDistance&&t.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:c||t.has("EXT_frag_depth"),rendererExtensionDrawBuffers:c||t.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:c||t.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:f.customProgramCacheKey()}},getProgramCacheKey:function(f){const v=[];if(f.shaderID?v.push(f.shaderID):(v.push(f.customVertexShaderID),v.push(f.customFragmentShaderID)),f.defines!==void 0)for(const p in f.defines)v.push(p),v.push(f.defines[p]);return f.isRawShaderMaterial===!1&&((function(p,B){p.push(B.precision),p.push(B.outputColorSpace),p.push(B.envMapMode),p.push(B.envMapCubeUVHeight),p.push(B.mapUv),p.push(B.alphaMapUv),p.push(B.lightMapUv),p.push(B.aoMapUv),p.push(B.bumpMapUv),p.push(B.normalMapUv),p.push(B.displacementMapUv),p.push(B.emissiveMapUv),p.push(B.metalnessMapUv),p.push(B.roughnessMapUv),p.push(B.anisotropyMapUv),p.push(B.clearcoatMapUv),p.push(B.clearcoatNormalMapUv),p.push(B.clearcoatRoughnessMapUv),p.push(B.iridescenceMapUv),p.push(B.iridescenceThicknessMapUv),p.push(B.sheenColorMapUv),p.push(B.sheenRoughnessMapUv),p.push(B.specularMapUv),p.push(B.specularColorMapUv),p.push(B.specularIntensityMapUv),p.push(B.transmissionMapUv),p.push(B.thicknessMapUv),p.push(B.combine),p.push(B.fogExp2),p.push(B.sizeAttenuation),p.push(B.morphTargetsCount),p.push(B.morphAttributeCount),p.push(B.numDirLights),p.push(B.numPointLights),p.push(B.numSpotLights),p.push(B.numSpotLightMaps),p.push(B.numHemiLights),p.push(B.numRectAreaLights),p.push(B.numDirLightShadows),p.push(B.numPointLightShadows),p.push(B.numSpotLightShadows),p.push(B.numSpotLightShadowsWithMaps),p.push(B.numLightProbes),p.push(B.shadowMapType),p.push(B.toneMapping),p.push(B.numClippingPlanes),p.push(B.numClipIntersection),p.push(B.depthPacking)})(v,f),(function(p,B){o.disableAll(),B.isWebGL2&&o.enable(0),B.supportsVertexTextures&&o.enable(1),B.instancing&&o.enable(2),B.instancingColor&&o.enable(3),B.matcap&&o.enable(4),B.envMap&&o.enable(5),B.normalMapObjectSpace&&o.enable(6),B.normalMapTangentSpace&&o.enable(7),B.clearcoat&&o.enable(8),B.iridescence&&o.enable(9),B.alphaTest&&o.enable(10),B.vertexColors&&o.enable(11),B.vertexAlphas&&o.enable(12),B.vertexUv1s&&o.enable(13),B.vertexUv2s&&o.enable(14),B.vertexUv3s&&o.enable(15),B.vertexTangents&&o.enable(16),B.anisotropy&&o.enable(17),B.alphaHash&&o.enable(18),B.batching&&o.enable(19),p.push(o.mask),o.disableAll(),B.fog&&o.enable(0),B.useFog&&o.enable(1),B.flatShading&&o.enable(2),B.logarithmicDepthBuffer&&o.enable(3),B.skinning&&o.enable(4),B.morphTargets&&o.enable(5),B.morphNormals&&o.enable(6),B.morphColors&&o.enable(7),B.premultipliedAlpha&&o.enable(8),B.shadowMapEnabled&&o.enable(9),B.useLegacyLights&&o.enable(10),B.doubleSided&&o.enable(11),B.flipSided&&o.enable(12),B.useDepthPacking&&o.enable(13),B.dithering&&o.enable(14),B.transmission&&o.enable(15),B.sheen&&o.enable(16),B.opaque&&o.enable(17),B.pointsUvs&&o.enable(18),B.decodeVideoTexture&&o.enable(19),p.push(o.mask)})(v,f),v.push(r.outputColorSpace)),v.push(f.customProgramCacheKey),v.join()},getUniforms:function(f){const v=g[f.type];let p;if(v){const B=We[v];p=Uu.clone(B.uniforms)}else p=f.uniforms;return p},acquireProgram:function(f,v){let p;for(let B=0,T=l.length;B<T;B++){const S=l[B];if(S.cacheKey===v){p=S,++p.usedTimes;break}}return p===void 0&&(p=new Vh(r,v,f,i),l.push(p)),p},releaseProgram:function(f){if(--f.usedTimes==0){const v=l.indexOf(f);l[v]=l[l.length-1],l.pop(),f.destroy()}},releaseShaderCache:function(f){s.remove(f)},programs:l,dispose:function(){s.dispose()}}}function Xh(){let r=new WeakMap;return{get:function(A){let e=r.get(A);return e===void 0&&(e={},r.set(A,e)),e},remove:function(A){r.delete(A)},update:function(A,e,t){r.get(A)[e]=t},dispose:function(){r=new WeakMap}}}function Yh(r,A){return r.groupOrder!==A.groupOrder?r.groupOrder-A.groupOrder:r.renderOrder!==A.renderOrder?r.renderOrder-A.renderOrder:r.material.id!==A.material.id?r.material.id-A.material.id:r.z!==A.z?r.z-A.z:r.id-A.id}function Bo(r,A){return r.groupOrder!==A.groupOrder?r.groupOrder-A.groupOrder:r.renderOrder!==A.renderOrder?r.renderOrder-A.renderOrder:r.z!==A.z?A.z-r.z:r.id-A.id}function vo(){const r=[];let A=0;const e=[],t=[],n=[];function i(a,o,s,l,c,u){let h=r[A];return h===void 0?(h={id:a.id,object:a,geometry:o,material:s,groupOrder:l,renderOrder:a.renderOrder,z:c,group:u},r[A]=h):(h.id=a.id,h.object=a,h.geometry=o,h.material=s,h.groupOrder=l,h.renderOrder=a.renderOrder,h.z=c,h.group=u),A++,h}return{opaque:e,transmissive:t,transparent:n,init:function(){A=0,e.length=0,t.length=0,n.length=0},push:function(a,o,s,l,c,u){const h=i(a,o,s,l,c,u);s.transmission>0?t.push(h):s.transparent===!0?n.push(h):e.push(h)},unshift:function(a,o,s,l,c,u){const h=i(a,o,s,l,c,u);s.transmission>0?t.unshift(h):s.transparent===!0?n.unshift(h):e.unshift(h)},finish:function(){for(let a=A,o=r.length;a<o;a++){const s=r[a];if(s.id===null)break;s.id=null,s.object=null,s.geometry=null,s.material=null,s.group=null}},sort:function(a,o){e.length>1&&e.sort(a||Yh),t.length>1&&t.sort(o||Bo),n.length>1&&n.sort(o||Bo)}}}function Jh(){let r=new WeakMap;return{get:function(A,e){const t=r.get(A);let n;return t===void 0?(n=new vo,r.set(A,[n])):e>=t.length?(n=new vo,t.push(n)):n=t[e],n},dispose:function(){r=new WeakMap}}}function Zh(){const r={};return{get:function(A){if(r[A.id]!==void 0)return r[A.id];let e;switch(A.type){case"DirectionalLight":e={direction:new Q,color:new RA};break;case"SpotLight":e={position:new Q,direction:new Q,color:new RA,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new Q,color:new RA,distance:0,decay:0};break;case"HemisphereLight":e={direction:new Q,skyColor:new RA,groundColor:new RA};break;case"RectAreaLight":e={color:new RA,position:new Q,halfWidth:new Q,halfHeight:new Q}}return r[A.id]=e,e}}}let qh=0;function jh(r,A){return(A.castShadow?2:0)-(r.castShadow?2:0)+(A.map?1:0)-(r.map?1:0)}function $h(r,A){const e=new Zh,t=(function(){const s={};return{get:function(l){if(s[l.id]!==void 0)return s[l.id];let c;switch(l.type){case"DirectionalLight":case"SpotLight":c={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new TA};break;case"PointLight":c={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new TA,shadowCameraNear:1,shadowCameraFar:1e3}}return s[l.id]=c,c}}})(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let s=0;s<9;s++)n.probe.push(new Q);const i=new Q,a=new CA,o=new CA;return{setup:function(s,l){let c=0,u=0,h=0;for(let L=0;L<9;L++)n.probe[L].set(0,0,0);let d=0,g=0,m=0,f=0,v=0,p=0,B=0,T=0,S=0,E=0,x=0;s.sort(jh);const I=l===!0?Math.PI:1;for(let L=0,j=s.length;L<j;L++){const y=s[L],H=y.color,D=y.intensity,AA=y.distance,iA=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)c+=H.r*D*I,u+=H.g*D*I,h+=H.b*D*I;else if(y.isLightProbe){for(let k=0;k<9;k++)n.probe[k].addScaledVector(y.sh.coefficients[k],D);x++}else if(y.isDirectionalLight){const k=e.get(y);if(k.color.copy(y.color).multiplyScalar(y.intensity*I),y.castShadow){const G=y.shadow,W=t.get(y);W.shadowBias=G.bias,W.shadowNormalBias=G.normalBias,W.shadowRadius=G.radius,W.shadowMapSize=G.mapSize,n.directionalShadow[d]=W,n.directionalShadowMap[d]=iA,n.directionalShadowMatrix[d]=y.shadow.matrix,p++}n.directional[d]=k,d++}else if(y.isSpotLight){const k=e.get(y);k.position.setFromMatrixPosition(y.matrixWorld),k.color.copy(H).multiplyScalar(D*I),k.distance=AA,k.coneCos=Math.cos(y.angle),k.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),k.decay=y.decay,n.spot[m]=k;const G=y.shadow;if(y.map&&(n.spotLightMap[S]=y.map,S++,G.updateMatrices(y),y.castShadow&&E++),n.spotLightMatrix[m]=G.matrix,y.castShadow){const W=t.get(y);W.shadowBias=G.bias,W.shadowNormalBias=G.normalBias,W.shadowRadius=G.radius,W.shadowMapSize=G.mapSize,n.spotShadow[m]=W,n.spotShadowMap[m]=iA,T++}m++}else if(y.isRectAreaLight){const k=e.get(y);k.color.copy(H).multiplyScalar(D),k.halfWidth.set(.5*y.width,0,0),k.halfHeight.set(0,.5*y.height,0),n.rectArea[f]=k,f++}else if(y.isPointLight){const k=e.get(y);if(k.color.copy(y.color).multiplyScalar(y.intensity*I),k.distance=y.distance,k.decay=y.decay,y.castShadow){const G=y.shadow,W=t.get(y);W.shadowBias=G.bias,W.shadowNormalBias=G.normalBias,W.shadowRadius=G.radius,W.shadowMapSize=G.mapSize,W.shadowCameraNear=G.camera.near,W.shadowCameraFar=G.camera.far,n.pointShadow[g]=W,n.pointShadowMap[g]=iA,n.pointShadowMatrix[g]=y.shadow.matrix,B++}n.point[g]=k,g++}else if(y.isHemisphereLight){const k=e.get(y);k.skyColor.copy(y.color).multiplyScalar(D*I),k.groundColor.copy(y.groundColor).multiplyScalar(D*I),n.hemi[v]=k,v++}}f>0&&(A.isWebGL2?r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=nA.LTC_FLOAT_1,n.rectAreaLTC2=nA.LTC_FLOAT_2):(n.rectAreaLTC1=nA.LTC_HALF_1,n.rectAreaLTC2=nA.LTC_HALF_2):r.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=nA.LTC_FLOAT_1,n.rectAreaLTC2=nA.LTC_FLOAT_2):r.has("OES_texture_half_float_linear")===!0?(n.rectAreaLTC1=nA.LTC_HALF_1,n.rectAreaLTC2=nA.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),n.ambient[0]=c,n.ambient[1]=u,n.ambient[2]=h;const M=n.hash;M.directionalLength===d&&M.pointLength===g&&M.spotLength===m&&M.rectAreaLength===f&&M.hemiLength===v&&M.numDirectionalShadows===p&&M.numPointShadows===B&&M.numSpotShadows===T&&M.numSpotMaps===S&&M.numLightProbes===x||(n.directional.length=d,n.spot.length=m,n.rectArea.length=f,n.point.length=g,n.hemi.length=v,n.directionalShadow.length=p,n.directionalShadowMap.length=p,n.pointShadow.length=B,n.pointShadowMap.length=B,n.spotShadow.length=T,n.spotShadowMap.length=T,n.directionalShadowMatrix.length=p,n.pointShadowMatrix.length=B,n.spotLightMatrix.length=T+S-E,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=x,M.directionalLength=d,M.pointLength=g,M.spotLength=m,M.rectAreaLength=f,M.hemiLength=v,M.numDirectionalShadows=p,M.numPointShadows=B,M.numSpotShadows=T,M.numSpotMaps=S,M.numLightProbes=x,n.version=qh++)},setupView:function(s,l){let c=0,u=0,h=0,d=0,g=0;const m=l.matrixWorldInverse;for(let f=0,v=s.length;f<v;f++){const p=s[f];if(p.isDirectionalLight){const B=n.directional[c];B.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),B.direction.sub(i),B.direction.transformDirection(m),c++}else if(p.isSpotLight){const B=n.spot[h];B.position.setFromMatrixPosition(p.matrixWorld),B.position.applyMatrix4(m),B.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),B.direction.sub(i),B.direction.transformDirection(m),h++}else if(p.isRectAreaLight){const B=n.rectArea[d];B.position.setFromMatrixPosition(p.matrixWorld),B.position.applyMatrix4(m),o.identity(),a.copy(p.matrixWorld),a.premultiply(m),o.extractRotation(a),B.halfWidth.set(.5*p.width,0,0),B.halfHeight.set(0,.5*p.height,0),B.halfWidth.applyMatrix4(o),B.halfHeight.applyMatrix4(o),d++}else if(p.isPointLight){const B=n.point[u];B.position.setFromMatrixPosition(p.matrixWorld),B.position.applyMatrix4(m),u++}else if(p.isHemisphereLight){const B=n.hemi[g];B.direction.setFromMatrixPosition(p.matrixWorld),B.direction.transformDirection(m),g++}}},state:n}}function wo(r,A){const e=new $h(r,A),t=[],n=[];return{init:function(){t.length=0,n.length=0},state:{lightsArray:t,shadowsArray:n,lights:e},setupLights:function(i){e.setup(t,i)},setupLightsView:function(i){e.setupView(t,i)},pushLight:function(i){t.push(i)},pushShadow:function(i){n.push(i)}}}function Ad(r,A){let e=new WeakMap;return{get:function(t,n=0){const i=e.get(t);let a;return i===void 0?(a=new wo(r,A),e.set(t,[a])):n>=i.length?(a=new wo(r,A),i.push(a)):a=i[n],a},dispose:function(){e=new WeakMap}}}class ed extends $r{constructor(A){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(A)}copy(A){return super.copy(A),this.depthPacking=A.depthPacking,this.map=A.map,this.alphaMap=A.alphaMap,this.displacementMap=A.displacementMap,this.displacementScale=A.displacementScale,this.displacementBias=A.displacementBias,this.wireframe=A.wireframe,this.wireframeLinewidth=A.wireframeLinewidth,this}}class td extends $r{constructor(A){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(A)}copy(A){return super.copy(A),this.map=A.map,this.alphaMap=A.alphaMap,this.displacementMap=A.displacementMap,this.displacementScale=A.displacementScale,this.displacementBias=A.displacementBias,this}}function rd(r,A,e){let t=new Ci;const n=new TA,i=new TA,a=new ZA,o=new ed({depthPacking:3201}),s=new td,l={},c=e.maxTextureSize,u={0:1,1:0,2:2},h=new Nt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new TA},radius:{value:4}},vertexShader:`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fragmentShader:`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`}),d=h.clone();d.defines.HORIZONTAL_PASS=1;const g=new Gt;g.setAttribute("position",new Xe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const m=new be(g,h),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let v=this.type;function p(E,x){const I=A.update(m);h.defines.VSM_SAMPLES!==E.blurSamples&&(h.defines.VSM_SAMPLES=E.blurSamples,d.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new Ot(n.x,n.y)),h.uniforms.shadow_pass.value=E.map.texture,h.uniforms.resolution.value=E.mapSize,h.uniforms.radius.value=E.radius,r.setRenderTarget(E.mapPass),r.clear(),r.renderBufferDirect(x,null,I,h,m,null),d.uniforms.shadow_pass.value=E.mapPass.texture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,r.setRenderTarget(E.map),r.clear(),r.renderBufferDirect(x,null,I,d,m,null)}function B(E,x,I,M){let L=null;const j=I.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(j!==void 0)L=j;else if(L=I.isPointLight===!0?s:o,r.localClippingEnabled&&x.clipShadows===!0&&Array.isArray(x.clippingPlanes)&&x.clippingPlanes.length!==0||x.displacementMap&&x.displacementScale!==0||x.alphaMap&&x.alphaTest>0||x.map&&x.alphaTest>0){const y=L.uuid,H=x.uuid;let D=l[y];D===void 0&&(D={},l[y]=D);let AA=D[H];AA===void 0&&(AA=L.clone(),D[H]=AA,x.addEventListener("dispose",S)),L=AA}return L.visible=x.visible,L.wireframe=x.wireframe,L.side=M===3?x.shadowSide!==null?x.shadowSide:x.side:x.shadowSide!==null?x.shadowSide:u[x.side],L.alphaMap=x.alphaMap,L.alphaTest=x.alphaTest,L.map=x.map,L.clipShadows=x.clipShadows,L.clippingPlanes=x.clippingPlanes,L.clipIntersection=x.clipIntersection,L.displacementMap=x.displacementMap,L.displacementScale=x.displacementScale,L.displacementBias=x.displacementBias,L.wireframeLinewidth=x.wireframeLinewidth,L.linewidth=x.linewidth,I.isPointLight===!0&&L.isMeshDistanceMaterial===!0&&(r.properties.get(L).light=I),L}function T(E,x,I,M,L){if(E.visible===!1)return;if(E.layers.test(x.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&L===3)&&(!E.frustumCulled||t.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,E.matrixWorld);const y=A.update(E),H=E.material;if(Array.isArray(H)){const D=y.groups;for(let AA=0,iA=D.length;AA<iA;AA++){const k=D[AA],G=H[k.materialIndex];if(G&&G.visible){const W=B(E,G,M,L);E.onBeforeShadow(r,E,x,I,y,W,k),r.renderBufferDirect(I,null,y,W,E,k),E.onAfterShadow(r,E,x,I,y,W,k)}}}else if(H.visible){const D=B(E,H,M,L);E.onBeforeShadow(r,E,x,I,y,D,null),r.renderBufferDirect(I,null,y,D,E,null),E.onAfterShadow(r,E,x,I,y,D,null)}}const j=E.children;for(let y=0,H=j.length;y<H;y++)T(j[y],x,I,M,L)}function S(E){E.target.removeEventListener("dispose",S);for(const x in l){const I=l[x],M=E.target.uuid;M in I&&(I[M].dispose(),delete I[M])}}this.render=function(E,x,I){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||E.length===0)return;const M=r.getRenderTarget(),L=r.getActiveCubeFace(),j=r.getActiveMipmapLevel(),y=r.state;y.setBlending(0),y.buffers.color.setClear(1,1,1,1),y.buffers.depth.setTest(!0),y.setScissorTest(!1);const H=v!==3&&this.type===3,D=v===3&&this.type!==3;for(let AA=0,iA=E.length;AA<iA;AA++){const k=E[AA],G=k.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",k,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;n.copy(G.mapSize);const W=G.getFrameExtents();if(n.multiply(W),i.copy(G.mapSize),(n.x>c||n.y>c)&&(n.x>c&&(i.x=Math.floor(c/W.x),n.x=i.x*W.x,G.mapSize.x=i.x),n.y>c&&(i.y=Math.floor(c/W.y),n.y=i.y*W.y,G.mapSize.y=i.y)),G.map===null||H===!0||D===!0){const V=this.type!==3?{minFilter:1003,magFilter:1003}:{};G.map!==null&&G.map.dispose(),G.map=new Ot(n.x,n.y,V),G.map.texture.name=k.name+".shadowMap",G.camera.updateProjectionMatrix()}r.setRenderTarget(G.map),r.clear();const R=G.getViewportCount();for(let V=0;V<R;V++){const rA=G.getViewport(V);a.set(i.x*rA.x,i.y*rA.y,i.x*rA.z,i.y*rA.w),y.viewport(a),G.updateMatrices(k,V),t=G.getFrustum(),T(x,I,G.camera,k,this.type)}G.isPointLightShadow!==!0&&this.type===3&&p(G,I),G.needsUpdate=!1}v=this.type,f.needsUpdate=!1,r.setRenderTarget(M,L,j)}}function nd(r,A,e){const t=e.isWebGL2,n=new function(){let C=!1;const aA=new ZA;let Y=null;const K=new ZA(0,0,0,0);return{setMask:function(eA){Y===eA||C||(r.colorMask(eA,eA,eA,eA),Y=eA)},setLocked:function(eA){C=eA},setClear:function(eA,uA,hA,gA,wA){wA===!0&&(eA*=gA,uA*=gA,hA*=gA),aA.set(eA,uA,hA,gA),K.equals(aA)===!1&&(r.clearColor(eA,uA,hA,gA),K.copy(aA))},reset:function(){C=!1,Y=null,K.set(-1,0,0,0)}}},i=new function(){let C=!1,aA=null,Y=null,K=null;return{setTest:function(eA){eA?O(r.DEPTH_TEST):F(r.DEPTH_TEST)},setMask:function(eA){aA===eA||C||(r.depthMask(eA),aA=eA)},setFunc:function(eA){if(Y!==eA){switch(eA){case 0:r.depthFunc(r.NEVER);break;case 1:r.depthFunc(r.ALWAYS);break;case 2:r.depthFunc(r.LESS);break;case 3:default:r.depthFunc(r.LEQUAL);break;case 4:r.depthFunc(r.EQUAL);break;case 5:r.depthFunc(r.GEQUAL);break;case 6:r.depthFunc(r.GREATER);break;case 7:r.depthFunc(r.NOTEQUAL)}Y=eA}},setLocked:function(eA){C=eA},setClear:function(eA){K!==eA&&(r.clearDepth(eA),K=eA)},reset:function(){C=!1,aA=null,Y=null,K=null}}},a=new function(){let C=!1,aA=null,Y=null,K=null,eA=null,uA=null,hA=null,gA=null,wA=null;return{setTest:function(fA){C||(fA?O(r.STENCIL_TEST):F(r.STENCIL_TEST))},setMask:function(fA){aA===fA||C||(r.stencilMask(fA),aA=fA)},setFunc:function(fA,pA,yA){Y===fA&&K===pA&&eA===yA||(r.stencilFunc(fA,pA,yA),Y=fA,K=pA,eA=yA)},setOp:function(fA,pA,yA){uA===fA&&hA===pA&&gA===yA||(r.stencilOp(fA,pA,yA),uA=fA,hA=pA,gA=yA)},setLocked:function(fA){C=fA},setClear:function(fA){wA!==fA&&(r.clearStencil(fA),wA=fA)},reset:function(){C=!1,aA=null,Y=null,K=null,eA=null,uA=null,hA=null,gA=null,wA=null}}},o=new WeakMap,s=new WeakMap;let l={},c={},u=new WeakMap,h=[],d=null,g=!1,m=null,f=null,v=null,p=null,B=null,T=null,S=null,E=new RA(0,0,0),x=0,I=!1,M=null,L=null,j=null,y=null,H=null;const D=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let AA=!1,iA=0;const k=r.getParameter(r.VERSION);k.indexOf("WebGL")!==-1?(iA=parseFloat(/^WebGL (\d)/.exec(k)[1]),AA=iA>=1):k.indexOf("OpenGL ES")!==-1&&(iA=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),AA=iA>=2);let G=null,W={};const R=r.getParameter(r.SCISSOR_BOX),V=r.getParameter(r.VIEWPORT),rA=new ZA().fromArray(R),w=new ZA().fromArray(V);function _(C,aA,Y,K){const eA=new Uint8Array(4),uA=r.createTexture();r.bindTexture(C,uA),r.texParameteri(C,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(C,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let hA=0;hA<Y;hA++)!t||C!==r.TEXTURE_3D&&C!==r.TEXTURE_2D_ARRAY?r.texImage2D(aA+hA,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,eA):r.texImage3D(aA,0,r.RGBA,1,1,K,0,r.RGBA,r.UNSIGNED_BYTE,eA);return uA}const b={};function O(C){l[C]!==!0&&(r.enable(C),l[C]=!0)}function F(C){l[C]!==!1&&(r.disable(C),l[C]=!1)}b[r.TEXTURE_2D]=_(r.TEXTURE_2D,r.TEXTURE_2D,1),b[r.TEXTURE_CUBE_MAP]=_(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),t&&(b[r.TEXTURE_2D_ARRAY]=_(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),b[r.TEXTURE_3D]=_(r.TEXTURE_3D,r.TEXTURE_3D,1,1)),n.setClear(0,0,0,1),i.setClear(1),a.setClear(0),O(r.DEPTH_TEST),i.setFunc(3),tA(!1),cA(1),O(r.CULL_FACE),q(0);const X={100:r.FUNC_ADD,101:r.FUNC_SUBTRACT,102:r.FUNC_REVERSE_SUBTRACT};if(t)X[103]=r.MIN,X[104]=r.MAX;else{const C=A.get("EXT_blend_minmax");C!==null&&(X[103]=C.MIN_EXT,X[104]=C.MAX_EXT)}const Z={200:r.ZERO,201:r.ONE,202:r.SRC_COLOR,204:r.SRC_ALPHA,210:r.SRC_ALPHA_SATURATE,208:r.DST_COLOR,206:r.DST_ALPHA,203:r.ONE_MINUS_SRC_COLOR,205:r.ONE_MINUS_SRC_ALPHA,209:r.ONE_MINUS_DST_COLOR,207:r.ONE_MINUS_DST_ALPHA,211:r.CONSTANT_COLOR,212:r.ONE_MINUS_CONSTANT_COLOR,213:r.CONSTANT_ALPHA,214:r.ONE_MINUS_CONSTANT_ALPHA};function q(C,aA,Y,K,eA,uA,hA,gA,wA,fA){if(C!==0){if(g===!1&&(O(r.BLEND),g=!0),C===5)eA=eA||aA,uA=uA||Y,hA=hA||K,aA===f&&eA===B||(r.blendEquationSeparate(X[aA],X[eA]),f=aA,B=eA),Y===v&&K===p&&uA===T&&hA===S||(r.blendFuncSeparate(Z[Y],Z[K],Z[uA],Z[hA]),v=Y,p=K,T=uA,S=hA),gA.equals(E)!==!1&&wA===x||(r.blendColor(gA.r,gA.g,gA.b,wA),E.copy(gA),x=wA),m=C,I=!1;else if(C!==m||fA!==I){if(f===100&&B===100||(r.blendEquation(r.FUNC_ADD),f=100,B=100),fA)switch(C){case 1:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case 2:r.blendFunc(r.ONE,r.ONE);break;case 3:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case 4:r.blendFuncSeparate(r.ZERO,r.SRC_COLOR,r.ZERO,r.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",C)}else switch(C){case 1:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case 2:r.blendFunc(r.SRC_ALPHA,r.ONE);break;case 3:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case 4:r.blendFunc(r.ZERO,r.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",C)}v=null,p=null,T=null,S=null,E.set(0,0,0),x=0,m=C,I=fA}}else g===!0&&(F(r.BLEND),g=!1)}function tA(C){M!==C&&(C?r.frontFace(r.CW):r.frontFace(r.CCW),M=C)}function cA(C){C!==0?(O(r.CULL_FACE),C!==L&&(C===1?r.cullFace(r.BACK):C===2?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):F(r.CULL_FACE),L=C}function dA(C,aA,Y){C?(O(r.POLYGON_OFFSET_FILL),y===aA&&H===Y||(r.polygonOffset(aA,Y),y=aA,H=Y)):F(r.POLYGON_OFFSET_FILL)}return{buffers:{color:n,depth:i,stencil:a},enable:O,disable:F,bindFramebuffer:function(C,aA){return c[C]!==aA&&(r.bindFramebuffer(C,aA),c[C]=aA,t&&(C===r.DRAW_FRAMEBUFFER&&(c[r.FRAMEBUFFER]=aA),C===r.FRAMEBUFFER&&(c[r.DRAW_FRAMEBUFFER]=aA)),!0)},drawBuffers:function(C,aA){let Y=h,K=!1;if(C)if(Y=u.get(aA),Y===void 0&&(Y=[],u.set(aA,Y)),C.isWebGLMultipleRenderTargets){const eA=C.texture;if(Y.length!==eA.length||Y[0]!==r.COLOR_ATTACHMENT0){for(let uA=0,hA=eA.length;uA<hA;uA++)Y[uA]=r.COLOR_ATTACHMENT0+uA;Y.length=eA.length,K=!0}}else Y[0]!==r.COLOR_ATTACHMENT0&&(Y[0]=r.COLOR_ATTACHMENT0,K=!0);else Y[0]!==r.BACK&&(Y[0]=r.BACK,K=!0);K&&(e.isWebGL2?r.drawBuffers(Y):A.get("WEBGL_draw_buffers").drawBuffersWEBGL(Y))},useProgram:function(C){return d!==C&&(r.useProgram(C),d=C,!0)},setBlending:q,setMaterial:function(C,aA){C.side===2?F(r.CULL_FACE):O(r.CULL_FACE);let Y=C.side===1;aA&&(Y=!Y),tA(Y),C.blending===1&&C.transparent===!1?q(0):q(C.blending,C.blendEquation,C.blendSrc,C.blendDst,C.blendEquationAlpha,C.blendSrcAlpha,C.blendDstAlpha,C.blendColor,C.blendAlpha,C.premultipliedAlpha),i.setFunc(C.depthFunc),i.setTest(C.depthTest),i.setMask(C.depthWrite),n.setMask(C.colorWrite);const K=C.stencilWrite;a.setTest(K),K&&(a.setMask(C.stencilWriteMask),a.setFunc(C.stencilFunc,C.stencilRef,C.stencilFuncMask),a.setOp(C.stencilFail,C.stencilZFail,C.stencilZPass)),dA(C.polygonOffset,C.polygonOffsetFactor,C.polygonOffsetUnits),C.alphaToCoverage===!0?O(r.SAMPLE_ALPHA_TO_COVERAGE):F(r.SAMPLE_ALPHA_TO_COVERAGE)},setFlipSided:tA,setCullFace:cA,setLineWidth:function(C){C!==j&&(AA&&r.lineWidth(C),j=C)},setPolygonOffset:dA,setScissorTest:function(C){C?O(r.SCISSOR_TEST):F(r.SCISSOR_TEST)},activeTexture:function(C){C===void 0&&(C=r.TEXTURE0+D-1),G!==C&&(r.activeTexture(C),G=C)},bindTexture:function(C,aA,Y){Y===void 0&&(Y=G===null?r.TEXTURE0+D-1:G);let K=W[Y];K===void 0&&(K={type:void 0,texture:void 0},W[Y]=K),K.type===C&&K.texture===aA||(G!==Y&&(r.activeTexture(Y),G=Y),r.bindTexture(C,aA||b[C]),K.type=C,K.texture=aA)},unbindTexture:function(){const C=W[G];C!==void 0&&C.type!==void 0&&(r.bindTexture(C.type,null),C.type=void 0,C.texture=void 0)},compressedTexImage2D:function(){try{r.compressedTexImage2D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},compressedTexImage3D:function(){try{r.compressedTexImage3D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},texImage2D:function(){try{r.texImage2D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},texImage3D:function(){try{r.texImage3D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},updateUBOMapping:function(C,aA){let Y=s.get(aA);Y===void 0&&(Y=new WeakMap,s.set(aA,Y));let K=Y.get(C);K===void 0&&(K=r.getUniformBlockIndex(aA,C.name),Y.set(C,K))},uniformBlockBinding:function(C,aA){const Y=s.get(aA).get(C);o.get(aA)!==Y&&(r.uniformBlockBinding(aA,Y,C.__bindingPointIndex),o.set(aA,Y))},texStorage2D:function(){try{r.texStorage2D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},texStorage3D:function(){try{r.texStorage3D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},texSubImage2D:function(){try{r.texSubImage2D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},texSubImage3D:function(){try{r.texSubImage3D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},compressedTexSubImage2D:function(){try{r.compressedTexSubImage2D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},compressedTexSubImage3D:function(){try{r.compressedTexSubImage3D.apply(r,arguments)}catch(C){console.error("THREE.WebGLState:",C)}},scissor:function(C){rA.equals(C)===!1&&(r.scissor(C.x,C.y,C.z,C.w),rA.copy(C))},viewport:function(C){w.equals(C)===!1&&(r.viewport(C.x,C.y,C.z,C.w),w.copy(C))},reset:function(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),t===!0&&(r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null)),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),l={},G=null,W={},c={},u=new WeakMap,h=[],d=null,g=!1,m=null,f=null,v=null,p=null,B=null,T=null,S=null,E=new RA(0,0,0),x=0,I=!1,M=null,L=null,j=null,y=null,H=null,rA.set(0,0,r.canvas.width,r.canvas.height),w.set(0,0,r.canvas.width,r.canvas.height),n.reset(),i.reset(),a.reset()}}}function id(r,A,e,t,n,i,a){const o=n.isWebGL2,s=A.has("WEBGL_multisampled_render_to_texture")?A.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator<"u"&&/OculusBrowser/g.test(navigator.userAgent),c=new WeakMap;let u;const h=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(w,_){return d?new OffscreenCanvas(w,_):oi("canvas")}function m(w,_,b,O){let F=1;if((w.width>O||w.height>O)&&(F=O/Math.max(w.width,w.height)),F<1||_===!0){if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap){const X=_?Ra:Math.floor,Z=X(F*w.width),q=X(F*w.height);u===void 0&&(u=g(Z,q));const tA=b?g(Z,q):u;return tA.width=Z,tA.height=q,tA.getContext("2d").drawImage(w,0,0,Z,q),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+w.width+"x"+w.height+") to ("+Z+"x"+q+")."),tA}return"data"in w&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+w.width+"x"+w.height+")."),w}return w}function f(w){return Rs(w.width)&&Rs(w.height)}function v(w,_){return w.generateMipmaps&&_&&w.minFilter!==1003&&w.minFilter!==1006}function p(w){r.generateMipmap(w)}function B(w,_,b,O,F=!1){if(o===!1)return _;if(w!==null){if(r[w]!==void 0)return r[w];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let X=_;if(_===r.RED&&(b===r.FLOAT&&(X=r.R32F),b===r.HALF_FLOAT&&(X=r.R16F),b===r.UNSIGNED_BYTE&&(X=r.R8)),_===r.RED_INTEGER&&(b===r.UNSIGNED_BYTE&&(X=r.R8UI),b===r.UNSIGNED_SHORT&&(X=r.R16UI),b===r.UNSIGNED_INT&&(X=r.R32UI),b===r.BYTE&&(X=r.R8I),b===r.SHORT&&(X=r.R16I),b===r.INT&&(X=r.R32I)),_===r.RG&&(b===r.FLOAT&&(X=r.RG32F),b===r.HALF_FLOAT&&(X=r.RG16F),b===r.UNSIGNED_BYTE&&(X=r.RG8)),_===r.RGBA){const Z=F?ai:PA.getTransfer(O);b===r.FLOAT&&(X=r.RGBA32F),b===r.HALF_FLOAT&&(X=r.RGBA16F),b===r.UNSIGNED_BYTE&&(X=Z===GA?r.SRGB8_ALPHA8:r.RGBA8),b===r.UNSIGNED_SHORT_4_4_4_4&&(X=r.RGBA4),b===r.UNSIGNED_SHORT_5_5_5_1&&(X=r.RGB5_A1)}return X!==r.R16F&&X!==r.R32F&&X!==r.RG16F&&X!==r.RG32F&&X!==r.RGBA16F&&X!==r.RGBA32F||A.get("EXT_color_buffer_float"),X}function T(w,_,b){return v(w,b)===!0||w.isFramebufferTexture&&w.minFilter!==1003&&w.minFilter!==1006?Math.log2(Math.max(_.width,_.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?_.mipmaps.length:1}function S(w){return w===1003||w===1004||w===1005?r.NEAREST:r.LINEAR}function E(w){const _=w.target;_.removeEventListener("dispose",E),(function(b){const O=t.get(b);if(O.__webglInit===void 0)return;const F=b.source,X=h.get(F);if(X){const Z=X[O.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&I(b),Object.keys(X).length===0&&h.delete(F)}t.remove(b)})(_),_.isVideoTexture&&c.delete(_)}function x(w){const _=w.target;_.removeEventListener("dispose",x),(function(b){const O=b.texture,F=t.get(b),X=t.get(O);if(X.__webglTexture!==void 0&&(r.deleteTexture(X.__webglTexture),a.memory.textures--),b.depthTexture&&b.depthTexture.dispose(),b.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(F.__webglFramebuffer[Z]))for(let q=0;q<F.__webglFramebuffer[Z].length;q++)r.deleteFramebuffer(F.__webglFramebuffer[Z][q]);else r.deleteFramebuffer(F.__webglFramebuffer[Z]);F.__webglDepthbuffer&&r.deleteRenderbuffer(F.__webglDepthbuffer[Z])}else{if(Array.isArray(F.__webglFramebuffer))for(let Z=0;Z<F.__webglFramebuffer.length;Z++)r.deleteFramebuffer(F.__webglFramebuffer[Z]);else r.deleteFramebuffer(F.__webglFramebuffer);if(F.__webglDepthbuffer&&r.deleteRenderbuffer(F.__webglDepthbuffer),F.__webglMultisampledFramebuffer&&r.deleteFramebuffer(F.__webglMultisampledFramebuffer),F.__webglColorRenderbuffer)for(let Z=0;Z<F.__webglColorRenderbuffer.length;Z++)F.__webglColorRenderbuffer[Z]&&r.deleteRenderbuffer(F.__webglColorRenderbuffer[Z]);F.__webglDepthRenderbuffer&&r.deleteRenderbuffer(F.__webglDepthRenderbuffer)}if(b.isWebGLMultipleRenderTargets)for(let Z=0,q=O.length;Z<q;Z++){const tA=t.get(O[Z]);tA.__webglTexture&&(r.deleteTexture(tA.__webglTexture),a.memory.textures--),t.remove(O[Z])}t.remove(O),t.remove(b)})(_)}function I(w){const _=t.get(w);r.deleteTexture(_.__webglTexture);const b=w.source;delete h.get(b)[_.__cacheKey],a.memory.textures--}let M=0;function L(w,_){const b=t.get(w);if(w.isVideoTexture&&(function(O){const F=a.render.frame;c.get(O)!==F&&(c.set(O,F),O.update())})(w),w.isRenderTargetTexture===!1&&w.version>0&&b.__version!==w.version){const O=w.image;if(O===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else{if(O.complete!==!1)return void iA(b,w,_);console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete")}}e.bindTexture(r.TEXTURE_2D,b.__webglTexture,r.TEXTURE0+_)}const j={1e3:r.REPEAT,1001:r.CLAMP_TO_EDGE,1002:r.MIRRORED_REPEAT},y={1003:r.NEAREST,1004:r.NEAREST_MIPMAP_NEAREST,1005:r.NEAREST_MIPMAP_LINEAR,1006:r.LINEAR,1007:r.LINEAR_MIPMAP_NEAREST,1008:r.LINEAR_MIPMAP_LINEAR},H={512:r.NEVER,519:r.ALWAYS,513:r.LESS,515:r.LEQUAL,514:r.EQUAL,518:r.GEQUAL,516:r.GREATER,517:r.NOTEQUAL};function D(w,_,b){if(b?(r.texParameteri(w,r.TEXTURE_WRAP_S,j[_.wrapS]),r.texParameteri(w,r.TEXTURE_WRAP_T,j[_.wrapT]),w!==r.TEXTURE_3D&&w!==r.TEXTURE_2D_ARRAY||r.texParameteri(w,r.TEXTURE_WRAP_R,j[_.wrapR]),r.texParameteri(w,r.TEXTURE_MAG_FILTER,y[_.magFilter]),r.texParameteri(w,r.TEXTURE_MIN_FILTER,y[_.minFilter])):(r.texParameteri(w,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(w,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),w!==r.TEXTURE_3D&&w!==r.TEXTURE_2D_ARRAY||r.texParameteri(w,r.TEXTURE_WRAP_R,r.CLAMP_TO_EDGE),_.wrapS===1001&&_.wrapT===1001||console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),r.texParameteri(w,r.TEXTURE_MAG_FILTER,S(_.magFilter)),r.texParameteri(w,r.TEXTURE_MIN_FILTER,S(_.minFilter)),_.minFilter!==1003&&_.minFilter!==1006&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),_.compareFunction&&(r.texParameteri(w,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(w,r.TEXTURE_COMPARE_FUNC,H[_.compareFunction])),A.has("EXT_texture_filter_anisotropic")===!0){const O=A.get("EXT_texture_filter_anisotropic");if(_.magFilter===1003||_.minFilter!==1005&&_.minFilter!==1008||_.type===1015&&A.has("OES_texture_float_linear")===!1||o===!1&&_.type===1016&&A.has("OES_texture_half_float_linear")===!1)return;(_.anisotropy>1||t.get(_).__currentAnisotropy)&&(r.texParameterf(w,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,n.getMaxAnisotropy())),t.get(_).__currentAnisotropy=_.anisotropy)}}function AA(w,_){let b=!1;w.__webglInit===void 0&&(w.__webglInit=!0,_.addEventListener("dispose",E));const O=_.source;let F=h.get(O);F===void 0&&(F={},h.set(O,F));const X=(function(Z){const q=[];return q.push(Z.wrapS),q.push(Z.wrapT),q.push(Z.wrapR||0),q.push(Z.magFilter),q.push(Z.minFilter),q.push(Z.anisotropy),q.push(Z.internalFormat),q.push(Z.format),q.push(Z.type),q.push(Z.generateMipmaps),q.push(Z.premultiplyAlpha),q.push(Z.flipY),q.push(Z.unpackAlignment),q.push(Z.colorSpace),q.join()})(_);if(X!==w.__cacheKey){F[X]===void 0&&(F[X]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,b=!0),F[X].usedTimes++;const Z=F[w.__cacheKey];Z!==void 0&&(F[w.__cacheKey].usedTimes--,Z.usedTimes===0&&I(_)),w.__cacheKey=X,w.__webglTexture=F[X].texture}return b}function iA(w,_,b){let O=r.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(O=r.TEXTURE_2D_ARRAY),_.isData3DTexture&&(O=r.TEXTURE_3D);const F=AA(w,_),X=_.source;e.bindTexture(O,w.__webglTexture,r.TEXTURE0+b);const Z=t.get(X);if(X.version!==Z.__version||F===!0){e.activeTexture(r.TEXTURE0+b);const q=PA.getPrimaries(PA.workingColorSpace),tA=_.colorSpace===""?null:PA.getPrimaries(_.colorSpace),cA=_.colorSpace===""||q===tA?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,_.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,_.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,cA);const dA=(function(pA){return!o&&(pA.wrapS!==1001||pA.wrapT!==1001||pA.minFilter!==1003&&pA.minFilter!==1006)})(_)&&f(_.image)===!1;let C=m(_.image,dA,!1,n.maxTextureSize);C=rA(_,C);const aA=f(C)||o,Y=i.convert(_.format,_.colorSpace);let K,eA=i.convert(_.type),uA=B(_.internalFormat,Y,eA,_.colorSpace,_.isVideoTexture);D(O,_,aA);const hA=_.mipmaps,gA=o&&_.isVideoTexture!==!0&&uA!==36196,wA=Z.__version===void 0||F===!0,fA=T(_,C,aA);if(_.isDepthTexture)uA=r.DEPTH_COMPONENT,o?uA=_.type===1015?r.DEPTH_COMPONENT32F:_.type===1014?r.DEPTH_COMPONENT24:_.type===1020?r.DEPTH24_STENCIL8:r.DEPTH_COMPONENT16:_.type===1015&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),_.format===1026&&uA===r.DEPTH_COMPONENT&&_.type!==1012&&_.type!==1014&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),_.type=1014,eA=i.convert(_.type)),_.format===1027&&uA===r.DEPTH_COMPONENT&&(uA=r.DEPTH_STENCIL,_.type!==1020&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),_.type=1020,eA=i.convert(_.type))),wA&&(gA?e.texStorage2D(r.TEXTURE_2D,1,uA,C.width,C.height):e.texImage2D(r.TEXTURE_2D,0,uA,C.width,C.height,0,Y,eA,null));else if(_.isDataTexture)if(hA.length>0&&aA){gA&&wA&&e.texStorage2D(r.TEXTURE_2D,fA,uA,hA[0].width,hA[0].height);for(let pA=0,yA=hA.length;pA<yA;pA++)K=hA[pA],gA?e.texSubImage2D(r.TEXTURE_2D,pA,0,0,K.width,K.height,Y,eA,K.data):e.texImage2D(r.TEXTURE_2D,pA,uA,K.width,K.height,0,Y,eA,K.data);_.generateMipmaps=!1}else gA?(wA&&e.texStorage2D(r.TEXTURE_2D,fA,uA,C.width,C.height),e.texSubImage2D(r.TEXTURE_2D,0,0,0,C.width,C.height,Y,eA,C.data)):e.texImage2D(r.TEXTURE_2D,0,uA,C.width,C.height,0,Y,eA,C.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){gA&&wA&&e.texStorage3D(r.TEXTURE_2D_ARRAY,fA,uA,hA[0].width,hA[0].height,C.depth);for(let pA=0,yA=hA.length;pA<yA;pA++)K=hA[pA],_.format!==1023?Y!==null?gA?e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,pA,0,0,0,K.width,K.height,C.depth,Y,K.data,0,0):e.compressedTexImage3D(r.TEXTURE_2D_ARRAY,pA,uA,K.width,K.height,C.depth,0,K.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):gA?e.texSubImage3D(r.TEXTURE_2D_ARRAY,pA,0,0,0,K.width,K.height,C.depth,Y,eA,K.data):e.texImage3D(r.TEXTURE_2D_ARRAY,pA,uA,K.width,K.height,C.depth,0,Y,eA,K.data)}else{gA&&wA&&e.texStorage2D(r.TEXTURE_2D,fA,uA,hA[0].width,hA[0].height);for(let pA=0,yA=hA.length;pA<yA;pA++)K=hA[pA],_.format!==1023?Y!==null?gA?e.compressedTexSubImage2D(r.TEXTURE_2D,pA,0,0,K.width,K.height,Y,K.data):e.compressedTexImage2D(r.TEXTURE_2D,pA,uA,K.width,K.height,0,K.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):gA?e.texSubImage2D(r.TEXTURE_2D,pA,0,0,K.width,K.height,Y,eA,K.data):e.texImage2D(r.TEXTURE_2D,pA,uA,K.width,K.height,0,Y,eA,K.data)}else if(_.isDataArrayTexture)gA?(wA&&e.texStorage3D(r.TEXTURE_2D_ARRAY,fA,uA,C.width,C.height,C.depth),e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,C.width,C.height,C.depth,Y,eA,C.data)):e.texImage3D(r.TEXTURE_2D_ARRAY,0,uA,C.width,C.height,C.depth,0,Y,eA,C.data);else if(_.isData3DTexture)gA?(wA&&e.texStorage3D(r.TEXTURE_3D,fA,uA,C.width,C.height,C.depth),e.texSubImage3D(r.TEXTURE_3D,0,0,0,0,C.width,C.height,C.depth,Y,eA,C.data)):e.texImage3D(r.TEXTURE_3D,0,uA,C.width,C.height,C.depth,0,Y,eA,C.data);else if(_.isFramebufferTexture){if(wA)if(gA)e.texStorage2D(r.TEXTURE_2D,fA,uA,C.width,C.height);else{let pA=C.width,yA=C.height;for(let he=0;he<fA;he++)e.texImage2D(r.TEXTURE_2D,he,uA,pA,yA,0,Y,eA,null),pA>>=1,yA>>=1}}else if(hA.length>0&&aA){gA&&wA&&e.texStorage2D(r.TEXTURE_2D,fA,uA,hA[0].width,hA[0].height);for(let pA=0,yA=hA.length;pA<yA;pA++)K=hA[pA],gA?e.texSubImage2D(r.TEXTURE_2D,pA,0,0,Y,eA,K):e.texImage2D(r.TEXTURE_2D,pA,uA,Y,eA,K);_.generateMipmaps=!1}else gA?(wA&&e.texStorage2D(r.TEXTURE_2D,fA,uA,C.width,C.height),e.texSubImage2D(r.TEXTURE_2D,0,0,0,Y,eA,C)):e.texImage2D(r.TEXTURE_2D,0,uA,Y,eA,C);v(_,aA)&&p(O),Z.__version=X.version,_.onUpdate&&_.onUpdate(_)}w.__version=_.version}function k(w,_,b,O,F,X){const Z=i.convert(b.format,b.colorSpace),q=i.convert(b.type),tA=B(b.internalFormat,Z,q,b.colorSpace);if(!t.get(_).__hasExternalTextures){const cA=Math.max(1,_.width>>X),dA=Math.max(1,_.height>>X);F===r.TEXTURE_3D||F===r.TEXTURE_2D_ARRAY?e.texImage3D(F,X,tA,cA,dA,_.depth,0,Z,q,null):e.texImage2D(F,X,tA,cA,dA,0,Z,q,null)}e.bindFramebuffer(r.FRAMEBUFFER,w),V(_)?s.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,O,F,t.get(b).__webglTexture,0,R(_)):(F===r.TEXTURE_2D||F>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&F<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,O,F,t.get(b).__webglTexture,X),e.bindFramebuffer(r.FRAMEBUFFER,null)}function G(w,_,b){if(r.bindRenderbuffer(r.RENDERBUFFER,w),_.depthBuffer&&!_.stencilBuffer){let O=o===!0?r.DEPTH_COMPONENT24:r.DEPTH_COMPONENT16;if(b||V(_)){const F=_.depthTexture;F&&F.isDepthTexture&&(F.type===1015?O=r.DEPTH_COMPONENT32F:F.type===1014&&(O=r.DEPTH_COMPONENT24));const X=R(_);V(_)?s.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,X,O,_.width,_.height):r.renderbufferStorageMultisample(r.RENDERBUFFER,X,O,_.width,_.height)}else r.renderbufferStorage(r.RENDERBUFFER,O,_.width,_.height);r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.RENDERBUFFER,w)}else if(_.depthBuffer&&_.stencilBuffer){const O=R(_);b&&V(_)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,O,r.DEPTH24_STENCIL8,_.width,_.height):V(_)?s.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,O,r.DEPTH24_STENCIL8,_.width,_.height):r.renderbufferStorage(r.RENDERBUFFER,r.DEPTH_STENCIL,_.width,_.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.RENDERBUFFER,w)}else{const O=_.isWebGLMultipleRenderTargets===!0?_.texture:[_.texture];for(let F=0;F<O.length;F++){const X=O[F],Z=i.convert(X.format,X.colorSpace),q=i.convert(X.type),tA=B(X.internalFormat,Z,q,X.colorSpace),cA=R(_);b&&V(_)===!1?r.renderbufferStorageMultisample(r.RENDERBUFFER,cA,tA,_.width,_.height):V(_)?s.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,cA,tA,_.width,_.height):r.renderbufferStorage(r.RENDERBUFFER,tA,_.width,_.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function W(w){const _=t.get(w),b=w.isWebGLCubeRenderTarget===!0;if(w.depthTexture&&!_.__autoAllocateDepthBuffer){if(b)throw new Error("target.depthTexture not supported in Cube render targets");(function(O,F){if(F&&F.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(r.FRAMEBUFFER,O),!F.depthTexture||!F.depthTexture.isDepthTexture)throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");t.get(F.depthTexture).__webglTexture&&F.depthTexture.image.width===F.width&&F.depthTexture.image.height===F.height||(F.depthTexture.image.width=F.width,F.depthTexture.image.height=F.height,F.depthTexture.needsUpdate=!0),L(F.depthTexture,0);const X=t.get(F.depthTexture).__webglTexture,Z=R(F);if(F.depthTexture.format===1026)V(F)?s.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,X,0,Z):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_ATTACHMENT,r.TEXTURE_2D,X,0);else{if(F.depthTexture.format!==1027)throw new Error("Unknown depthTexture format");V(F)?s.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,X,0,Z):r.framebufferTexture2D(r.FRAMEBUFFER,r.DEPTH_STENCIL_ATTACHMENT,r.TEXTURE_2D,X,0)}})(_.__webglFramebuffer,w)}else if(b){_.__webglDepthbuffer=[];for(let O=0;O<6;O++)e.bindFramebuffer(r.FRAMEBUFFER,_.__webglFramebuffer[O]),_.__webglDepthbuffer[O]=r.createRenderbuffer(),G(_.__webglDepthbuffer[O],w,!1)}else e.bindFramebuffer(r.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer=r.createRenderbuffer(),G(_.__webglDepthbuffer,w,!1);e.bindFramebuffer(r.FRAMEBUFFER,null)}function R(w){return Math.min(n.maxSamples,w.samples)}function V(w){const _=t.get(w);return o&&w.samples>0&&A.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function rA(w,_){const b=w.colorSpace,O=w.format,F=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||w.format===1035||b!==it&&b!==""&&(PA.getTransfer(b)===GA?o===!1?A.has("EXT_sRGB")===!0&&O===1023?(w.format=1035,w.minFilter=1006,w.generateMipmaps=!1):_=Sl.sRGBToLinear(_):O===1023&&F===1009||console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",b)),_}this.allocateTextureUnit=function(){const w=M;return w>=n.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+n.maxTextures),M+=1,w},this.resetTextureUnits=function(){M=0},this.setTexture2D=L,this.setTexture2DArray=function(w,_){const b=t.get(w);w.version>0&&b.__version!==w.version?iA(b,w,_):e.bindTexture(r.TEXTURE_2D_ARRAY,b.__webglTexture,r.TEXTURE0+_)},this.setTexture3D=function(w,_){const b=t.get(w);w.version>0&&b.__version!==w.version?iA(b,w,_):e.bindTexture(r.TEXTURE_3D,b.__webglTexture,r.TEXTURE0+_)},this.setTextureCube=function(w,_){const b=t.get(w);w.version>0&&b.__version!==w.version?(function(O,F,X){if(F.image.length!==6)return;const Z=AA(O,F),q=F.source;e.bindTexture(r.TEXTURE_CUBE_MAP,O.__webglTexture,r.TEXTURE0+X);const tA=t.get(q);if(q.version!==tA.__version||Z===!0){e.activeTexture(r.TEXTURE0+X);const cA=PA.getPrimaries(PA.workingColorSpace),dA=F.colorSpace===""?null:PA.getPrimaries(F.colorSpace),C=F.colorSpace===""||cA===dA?r.NONE:r.BROWSER_DEFAULT_WEBGL;r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,F.flipY),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),r.pixelStorei(r.UNPACK_ALIGNMENT,F.unpackAlignment),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,C);const aA=F.isCompressedTexture||F.image[0].isCompressedTexture,Y=F.image[0]&&F.image[0].isDataTexture,K=[];for(let mA=0;mA<6;mA++)K[mA]=aA||Y?Y?F.image[mA].image:F.image[mA]:m(F.image[mA],!1,!0,n.maxCubemapSize),K[mA]=rA(F,K[mA]);const eA=K[0],uA=f(eA)||o,hA=i.convert(F.format,F.colorSpace),gA=i.convert(F.type),wA=B(F.internalFormat,hA,gA,F.colorSpace),fA=o&&F.isVideoTexture!==!0,pA=tA.__version===void 0||Z===!0;let yA,he=T(F,eA,uA);if(D(r.TEXTURE_CUBE_MAP,F,uA),aA){fA&&pA&&e.texStorage2D(r.TEXTURE_CUBE_MAP,he,wA,eA.width,eA.height);for(let mA=0;mA<6;mA++){yA=K[mA].mipmaps;for(let IA=0;IA<yA.length;IA++){const MA=yA[IA];F.format!==1023?hA!==null?fA?e.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,IA,0,0,MA.width,MA.height,hA,MA.data):e.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,IA,wA,MA.width,MA.height,0,MA.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):fA?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,IA,0,0,MA.width,MA.height,hA,gA,MA.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,IA,wA,MA.width,MA.height,0,hA,gA,MA.data)}}}else{yA=F.mipmaps,fA&&pA&&(yA.length>0&&he++,e.texStorage2D(r.TEXTURE_CUBE_MAP,he,wA,K[0].width,K[0].height));for(let mA=0;mA<6;mA++)if(Y){fA?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,0,0,0,K[mA].width,K[mA].height,hA,gA,K[mA].data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,0,wA,K[mA].width,K[mA].height,0,hA,gA,K[mA].data);for(let IA=0;IA<yA.length;IA++){const MA=yA[IA].image[mA].image;fA?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,IA+1,0,0,MA.width,MA.height,hA,gA,MA.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,IA+1,wA,MA.width,MA.height,0,hA,gA,MA.data)}}else{fA?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,0,0,0,hA,gA,K[mA]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,0,wA,hA,gA,K[mA]);for(let IA=0;IA<yA.length;IA++){const MA=yA[IA];fA?e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,IA+1,0,0,hA,gA,MA.image[mA]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+mA,IA+1,wA,hA,gA,MA.image[mA])}}}v(F,uA)&&p(r.TEXTURE_CUBE_MAP),tA.__version=q.version,F.onUpdate&&F.onUpdate(F)}O.__version=F.version})(b,w,_):e.bindTexture(r.TEXTURE_CUBE_MAP,b.__webglTexture,r.TEXTURE0+_)},this.rebindTextures=function(w,_,b){const O=t.get(w);_!==void 0&&k(O.__webglFramebuffer,w,w.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),b!==void 0&&W(w)},this.setupRenderTarget=function(w){const _=w.texture,b=t.get(w),O=t.get(_);w.addEventListener("dispose",x),w.isWebGLMultipleRenderTargets!==!0&&(O.__webglTexture===void 0&&(O.__webglTexture=r.createTexture()),O.__version=_.version,a.memory.textures++);const F=w.isWebGLCubeRenderTarget===!0,X=w.isWebGLMultipleRenderTargets===!0,Z=f(w)||o;if(F){b.__webglFramebuffer=[];for(let q=0;q<6;q++)if(o&&_.mipmaps&&_.mipmaps.length>0){b.__webglFramebuffer[q]=[];for(let tA=0;tA<_.mipmaps.length;tA++)b.__webglFramebuffer[q][tA]=r.createFramebuffer()}else b.__webglFramebuffer[q]=r.createFramebuffer()}else{if(o&&_.mipmaps&&_.mipmaps.length>0){b.__webglFramebuffer=[];for(let q=0;q<_.mipmaps.length;q++)b.__webglFramebuffer[q]=r.createFramebuffer()}else b.__webglFramebuffer=r.createFramebuffer();if(X)if(n.drawBuffers){const q=w.texture;for(let tA=0,cA=q.length;tA<cA;tA++){const dA=t.get(q[tA]);dA.__webglTexture===void 0&&(dA.__webglTexture=r.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&w.samples>0&&V(w)===!1){const q=X?_:[_];b.__webglMultisampledFramebuffer=r.createFramebuffer(),b.__webglColorRenderbuffer=[],e.bindFramebuffer(r.FRAMEBUFFER,b.__webglMultisampledFramebuffer);for(let tA=0;tA<q.length;tA++){const cA=q[tA];b.__webglColorRenderbuffer[tA]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,b.__webglColorRenderbuffer[tA]);const dA=i.convert(cA.format,cA.colorSpace),C=i.convert(cA.type),aA=B(cA.internalFormat,dA,C,cA.colorSpace,w.isXRRenderTarget===!0),Y=R(w);r.renderbufferStorageMultisample(r.RENDERBUFFER,Y,aA,w.width,w.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+tA,r.RENDERBUFFER,b.__webglColorRenderbuffer[tA])}r.bindRenderbuffer(r.RENDERBUFFER,null),w.depthBuffer&&(b.__webglDepthRenderbuffer=r.createRenderbuffer(),G(b.__webglDepthRenderbuffer,w,!0)),e.bindFramebuffer(r.FRAMEBUFFER,null)}}if(F){e.bindTexture(r.TEXTURE_CUBE_MAP,O.__webglTexture),D(r.TEXTURE_CUBE_MAP,_,Z);for(let q=0;q<6;q++)if(o&&_.mipmaps&&_.mipmaps.length>0)for(let tA=0;tA<_.mipmaps.length;tA++)k(b.__webglFramebuffer[q][tA],w,_,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+q,tA);else k(b.__webglFramebuffer[q],w,_,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+q,0);v(_,Z)&&p(r.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(X){const q=w.texture;for(let tA=0,cA=q.length;tA<cA;tA++){const dA=q[tA],C=t.get(dA);e.bindTexture(r.TEXTURE_2D,C.__webglTexture),D(r.TEXTURE_2D,dA,Z),k(b.__webglFramebuffer,w,dA,r.COLOR_ATTACHMENT0+tA,r.TEXTURE_2D,0),v(dA,Z)&&p(r.TEXTURE_2D)}e.unbindTexture()}else{let q=r.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(o?q=w.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),e.bindTexture(q,O.__webglTexture),D(q,_,Z),o&&_.mipmaps&&_.mipmaps.length>0)for(let tA=0;tA<_.mipmaps.length;tA++)k(b.__webglFramebuffer[tA],w,_,r.COLOR_ATTACHMENT0,q,tA);else k(b.__webglFramebuffer,w,_,r.COLOR_ATTACHMENT0,q,0);v(_,Z)&&p(q),e.unbindTexture()}w.depthBuffer&&W(w)},this.updateRenderTargetMipmap=function(w){const _=f(w)||o,b=w.isWebGLMultipleRenderTargets===!0?w.texture:[w.texture];for(let O=0,F=b.length;O<F;O++){const X=b[O];if(v(X,_)){const Z=w.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:r.TEXTURE_2D,q=t.get(X).__webglTexture;e.bindTexture(Z,q),p(Z),e.unbindTexture()}}},this.updateMultisampleRenderTarget=function(w){if(o&&w.samples>0&&V(w)===!1){const _=w.isWebGLMultipleRenderTargets?w.texture:[w.texture],b=w.width,O=w.height;let F=r.COLOR_BUFFER_BIT;const X=[],Z=w.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,q=t.get(w),tA=w.isWebGLMultipleRenderTargets===!0;if(tA)for(let cA=0;cA<_.length;cA++)e.bindFramebuffer(r.FRAMEBUFFER,q.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+cA,r.RENDERBUFFER,null),e.bindFramebuffer(r.FRAMEBUFFER,q.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+cA,r.TEXTURE_2D,null,0);e.bindFramebuffer(r.READ_FRAMEBUFFER,q.__webglMultisampledFramebuffer),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,q.__webglFramebuffer);for(let cA=0;cA<_.length;cA++){X.push(r.COLOR_ATTACHMENT0+cA),w.depthBuffer&&X.push(Z);const dA=q.__ignoreDepthValues!==void 0&&q.__ignoreDepthValues;if(dA===!1&&(w.depthBuffer&&(F|=r.DEPTH_BUFFER_BIT),w.stencilBuffer&&(F|=r.STENCIL_BUFFER_BIT)),tA&&r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,q.__webglColorRenderbuffer[cA]),dA===!0&&(r.invalidateFramebuffer(r.READ_FRAMEBUFFER,[Z]),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[Z])),tA){const C=t.get(_[cA]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,C,0)}r.blitFramebuffer(0,0,b,O,0,0,b,O,F,r.NEAREST),l&&r.invalidateFramebuffer(r.READ_FRAMEBUFFER,X)}if(e.bindFramebuffer(r.READ_FRAMEBUFFER,null),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),tA)for(let cA=0;cA<_.length;cA++){e.bindFramebuffer(r.FRAMEBUFFER,q.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+cA,r.RENDERBUFFER,q.__webglColorRenderbuffer[cA]);const dA=t.get(_[cA]).__webglTexture;e.bindFramebuffer(r.FRAMEBUFFER,q.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+cA,r.TEXTURE_2D,dA,0)}e.bindFramebuffer(r.DRAW_FRAMEBUFFER,q.__webglMultisampledFramebuffer)}},this.setupDepthRenderbuffer=W,this.setupFrameBufferTexture=k,this.useMultisampledRTT=V}function ad(r,A,e){const t=e.isWebGL2;return{convert:function(n,i=""){let a;const o=PA.getTransfer(i);if(n===1009)return r.UNSIGNED_BYTE;if(n===1017)return r.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return r.UNSIGNED_SHORT_5_5_5_1;if(n===1010)return r.BYTE;if(n===1011)return r.SHORT;if(n===1012)return r.UNSIGNED_SHORT;if(n===1013)return r.INT;if(n===1014)return r.UNSIGNED_INT;if(n===1015)return r.FLOAT;if(n===1016)return t?r.HALF_FLOAT:(a=A.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(n===1021)return r.ALPHA;if(n===1023)return r.RGBA;if(n===1024)return r.LUMINANCE;if(n===1025)return r.LUMINANCE_ALPHA;if(n===1026)return r.DEPTH_COMPONENT;if(n===1027)return r.DEPTH_STENCIL;if(n===1035)return a=A.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(n===1028)return r.RED;if(n===1029)return r.RED_INTEGER;if(n===1030)return r.RG;if(n===1031)return r.RG_INTEGER;if(n===1033)return r.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779)if(o===GA){if(a=A.get("WEBGL_compressed_texture_s3tc_srgb"),a===null)return null;if(n===33776)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else{if(a=A.get("WEBGL_compressed_texture_s3tc"),a===null)return null;if(n===33776)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}if(n===35840||n===35841||n===35842||n===35843){if(a=A.get("WEBGL_compressed_texture_pvrtc"),a===null)return null;if(n===35840)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}if(n===36196)return a=A.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(n===37492||n===37496){if(a=A.get("WEBGL_compressed_texture_etc"),a===null)return null;if(n===37492)return o===GA?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(n===37496)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(a=A.get("WEBGL_compressed_texture_astc"),a===null)return null;if(n===37808)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return o===GA?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}if(n===36492||n===36494||n===36495){if(a=A.get("EXT_texture_compression_bptc"),a===null)return null;if(n===36492)return o===GA?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}if(n===36283||n===36284||n===36285||n===36286){if(a=A.get("EXT_texture_compression_rgtc"),a===null)return null;if(n===36492)return a.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}return n===1020?t?r.UNSIGNED_INT_24_8:(a=A.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):r[n]!==void 0?r[n]:null}}}class sd extends Ve{constructor(A=[]){super(),this.isArrayCamera=!0,this.cameras=A}}class Lr extends ue{constructor(){super(),this.isGroup=!0,this.type="Group"}}const od={type:"move"};class ca{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Lr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Lr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Q,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Q),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Lr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Q,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Q),this._grip}dispatchEvent(A){return this._targetRay!==null&&this._targetRay.dispatchEvent(A),this._grip!==null&&this._grip.dispatchEvent(A),this._hand!==null&&this._hand.dispatchEvent(A),this}connect(A){if(A&&A.hand){const e=this._hand;if(e)for(const t of A.hand.values())this._getHandJoint(e,t)}return this.dispatchEvent({type:"connected",data:A}),this}disconnect(A){return this.dispatchEvent({type:"disconnected",data:A}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(A,e,t){let n=null,i=null,a=null;const o=this._targetRay,s=this._grip,l=this._hand;if(A&&e.session.visibilityState!=="visible-blurred"){if(l&&A.hand){a=!0;for(const m of A.hand.values()){const f=e.getJointPose(m,t),v=this._getHandJoint(l,m);f!==null&&(v.matrix.fromArray(f.transform.matrix),v.matrix.decompose(v.position,v.rotation,v.scale),v.matrixWorldNeedsUpdate=!0,v.jointRadius=f.radius),v.visible=f!==null}const c=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],h=c.position.distanceTo(u.position),d=.02,g=.005;l.inputState.pinching&&h>d+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:A.handedness,target:this})):!l.inputState.pinching&&h<=d-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:A.handedness,target:this}))}else s!==null&&A.gripSpace&&(i=e.getPose(A.gripSpace,t),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(n=e.getPose(A.targetRaySpace,t),n===null&&i!==null&&(n=i),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(od)))}return o!==null&&(o.visible=n!==null),s!==null&&(s.visible=i!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(A,e){if(A.joints[e.jointName]===void 0){const t=new Lr;t.matrixAutoUpdate=!1,t.visible=!1,A.joints[e.jointName]=t,A.add(t)}return A.joints[e.jointName]}}class ld extends Br{constructor(A,e){super();const t=this;let n=null,i=1,a=null,o="local-floor",s=1,l=null,c=null,u=null,h=null,d=null,g=null;const m=e.getContextAttributes();let f=null,v=null;const p=[],B=[],T=new TA;let S=null;const E=new Ve;E.layers.enable(1),E.viewport=new ZA;const x=new Ve;x.layers.enable(2),x.viewport=new ZA;const I=[E,x],M=new sd;M.layers.enable(1),M.layers.enable(2);let L=null,j=null;function y(R){const V=B.indexOf(R.inputSource);if(V===-1)return;const rA=p[V];rA!==void 0&&(rA.update(R.inputSource,R.frame,l||a),rA.dispatchEvent({type:R.type,data:R.inputSource}))}function H(){n.removeEventListener("select",y),n.removeEventListener("selectstart",y),n.removeEventListener("selectend",y),n.removeEventListener("squeeze",y),n.removeEventListener("squeezestart",y),n.removeEventListener("squeezeend",y),n.removeEventListener("end",H),n.removeEventListener("inputsourceschange",D);for(let R=0;R<p.length;R++){const V=B[R];V!==null&&(B[R]=null,p[R].disconnect(V))}L=null,j=null,A.setRenderTarget(f),d=null,h=null,u=null,n=null,v=null,W.stop(),t.isPresenting=!1,A.setPixelRatio(S),A.setSize(T.width,T.height,!1),t.dispatchEvent({type:"sessionend"})}function D(R){for(let V=0;V<R.removed.length;V++){const rA=R.removed[V],w=B.indexOf(rA);w>=0&&(B[w]=null,p[w].disconnect(rA))}for(let V=0;V<R.added.length;V++){const rA=R.added[V];let w=B.indexOf(rA);if(w===-1){for(let b=0;b<p.length;b++){if(b>=B.length){B.push(rA),w=b;break}if(B[b]===null){B[b]=rA,w=b;break}}if(w===-1)break}const _=p[w];_&&_.connect(rA)}}this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(R){let V=p[R];return V===void 0&&(V=new ca,p[R]=V),V.getTargetRaySpace()},this.getControllerGrip=function(R){let V=p[R];return V===void 0&&(V=new ca,p[R]=V),V.getGripSpace()},this.getHand=function(R){let V=p[R];return V===void 0&&(V=new ca,p[R]=V),V.getHandSpace()},this.setFramebufferScaleFactor=function(R){i=R,t.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(R){o=R,t.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(R){l=R},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(R){if(n=R,n!==null){if(f=A.getRenderTarget(),n.addEventListener("select",y),n.addEventListener("selectstart",y),n.addEventListener("selectend",y),n.addEventListener("squeeze",y),n.addEventListener("squeezestart",y),n.addEventListener("squeezeend",y),n.addEventListener("end",H),n.addEventListener("inputsourceschange",D),m.xrCompatible!==!0&&await e.makeXRCompatible(),S=A.getPixelRatio(),A.getSize(T),n.renderState.layers===void 0||A.capabilities.isWebGL2===!1){const V={antialias:n.renderState.layers!==void 0||m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:i};d=new XRWebGLLayer(n,e,V),n.updateRenderState({baseLayer:d}),A.setPixelRatio(1),A.setSize(d.framebufferWidth,d.framebufferHeight,!1),v=new Ot(d.framebufferWidth,d.framebufferHeight,{format:1023,type:1009,colorSpace:A.outputColorSpace,stencilBuffer:m.stencil})}else{let V=null,rA=null,w=null;m.depth&&(w=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,V=m.stencil?1027:1026,rA=m.stencil?1020:1014);const _={colorFormat:e.RGBA8,depthFormat:w,scaleFactor:i};u=new XRWebGLBinding(n,e),h=u.createProjectionLayer(_),n.updateRenderState({layers:[h]}),A.setPixelRatio(1),A.setSize(h.textureWidth,h.textureHeight,!1),v=new Ot(h.textureWidth,h.textureHeight,{format:1023,type:1009,depthTexture:new Ol(h.textureWidth,h.textureHeight,rA,void 0,void 0,void 0,void 0,void 0,void 0,V),stencilBuffer:m.stencil,colorSpace:A.outputColorSpace,samples:m.antialias?4:0}),A.properties.get(v).__ignoreDepthValues=h.ignoreDepthValues}v.isXRRenderTarget=!0,this.setFoveation(s),l=null,a=await n.requestReferenceSpace(o),W.setContext(n),W.start(),t.isPresenting=!0,t.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode};const AA=new Q,iA=new Q;function k(R,V){V===null?R.matrixWorld.copy(R.matrix):R.matrixWorld.multiplyMatrices(V.matrixWorld,R.matrix),R.matrixWorldInverse.copy(R.matrixWorld).invert()}this.updateCamera=function(R){if(n===null)return;M.near=x.near=E.near=R.near,M.far=x.far=E.far=R.far,L===M.near&&j===M.far||(n.updateRenderState({depthNear:M.near,depthFar:M.far}),L=M.near,j=M.far);const V=R.parent,rA=M.cameras;k(M,V);for(let w=0;w<rA.length;w++)k(rA[w],V);rA.length===2?(function(w,_,b){AA.setFromMatrixPosition(_.matrixWorld),iA.setFromMatrixPosition(b.matrixWorld);const O=AA.distanceTo(iA),F=_.projectionMatrix.elements,X=b.projectionMatrix.elements,Z=F[14]/(F[10]-1),q=F[14]/(F[10]+1),tA=(F[9]+1)/F[5],cA=(F[9]-1)/F[5],dA=(F[8]-1)/F[0],C=(X[8]+1)/X[0],aA=Z*dA,Y=Z*C,K=O/(-dA+C),eA=K*-dA;_.matrixWorld.decompose(w.position,w.quaternion,w.scale),w.translateX(eA),w.translateZ(K),w.matrixWorld.compose(w.position,w.quaternion,w.scale),w.matrixWorldInverse.copy(w.matrixWorld).invert();const uA=Z+K,hA=q+K,gA=aA-eA,wA=Y+(O-eA),fA=tA*q/hA*uA,pA=cA*q/hA*uA;w.projectionMatrix.makePerspective(gA,wA,fA,pA,uA,hA),w.projectionMatrixInverse.copy(w.projectionMatrix).invert()})(M,E,x):M.projectionMatrix.copy(E.projectionMatrix),(function(w,_,b){b===null?w.matrix.copy(_.matrixWorld):(w.matrix.copy(b.matrixWorld),w.matrix.invert(),w.matrix.multiply(_.matrixWorld)),w.matrix.decompose(w.position,w.quaternion,w.scale),w.updateMatrixWorld(!0),w.projectionMatrix.copy(_.projectionMatrix),w.projectionMatrixInverse.copy(_.projectionMatrixInverse),w.isPerspectiveCamera&&(w.fov=2*La*Math.atan(1/w.projectionMatrix.elements[5]),w.zoom=1)})(R,M,V)},this.getCamera=function(){return M},this.getFoveation=function(){if(h!==null||d!==null)return s},this.setFoveation=function(R){s=R,h!==null&&(h.fixedFoveation=R),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=R)};let G=null;const W=new Pl;W.setAnimationLoop((function(R,V){if(c=V.getViewerPose(l||a),g=V,c!==null){const rA=c.views;d!==null&&(A.setRenderTargetFramebuffer(v,d.framebuffer),A.setRenderTarget(v));let w=!1;rA.length!==M.cameras.length&&(M.cameras.length=0,w=!0);for(let _=0;_<rA.length;_++){const b=rA[_];let O=null;if(d!==null)O=d.getViewport(b);else{const X=u.getViewSubImage(h,b);O=X.viewport,_===0&&(A.setRenderTargetTextures(v,X.colorTexture,h.ignoreDepthValues?void 0:X.depthStencilTexture),A.setRenderTarget(v))}let F=I[_];F===void 0&&(F=new Ve,F.layers.enable(_),F.viewport=new ZA,I[_]=F),F.matrix.fromArray(b.transform.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale),F.projectionMatrix.fromArray(b.projectionMatrix),F.projectionMatrixInverse.copy(F.projectionMatrix).invert(),F.viewport.set(O.x,O.y,O.width,O.height),_===0&&(M.matrix.copy(F.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),w===!0&&M.cameras.push(F)}}for(let rA=0;rA<p.length;rA++){const w=B[rA],_=p[rA];w!==null&&_!==void 0&&_.update(w,V,l||a)}G&&G(R,V),V.detectedPlanes&&t.dispatchEvent({type:"planesdetected",data:V}),g=null})),this.setAnimationLoop=function(R){G=R},this.dispose=function(){}}}function cd(r,A){function e(n,i){n.matrixAutoUpdate===!0&&n.updateMatrix(),i.value.copy(n.matrix)}function t(n,i){n.opacity.value=i.opacity,i.color&&n.diffuse.value.copy(i.color),i.emissive&&n.emissive.value.copy(i.emissive).multiplyScalar(i.emissiveIntensity),i.map&&(n.map.value=i.map,e(i.map,n.mapTransform)),i.alphaMap&&(n.alphaMap.value=i.alphaMap,e(i.alphaMap,n.alphaMapTransform)),i.bumpMap&&(n.bumpMap.value=i.bumpMap,e(i.bumpMap,n.bumpMapTransform),n.bumpScale.value=i.bumpScale,i.side===1&&(n.bumpScale.value*=-1)),i.normalMap&&(n.normalMap.value=i.normalMap,e(i.normalMap,n.normalMapTransform),n.normalScale.value.copy(i.normalScale),i.side===1&&n.normalScale.value.negate()),i.displacementMap&&(n.displacementMap.value=i.displacementMap,e(i.displacementMap,n.displacementMapTransform),n.displacementScale.value=i.displacementScale,n.displacementBias.value=i.displacementBias),i.emissiveMap&&(n.emissiveMap.value=i.emissiveMap,e(i.emissiveMap,n.emissiveMapTransform)),i.specularMap&&(n.specularMap.value=i.specularMap,e(i.specularMap,n.specularMapTransform)),i.alphaTest>0&&(n.alphaTest.value=i.alphaTest);const a=A.get(i).envMap;if(a&&(n.envMap.value=a,n.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,n.reflectivity.value=i.reflectivity,n.ior.value=i.ior,n.refractionRatio.value=i.refractionRatio),i.lightMap){n.lightMap.value=i.lightMap;const o=r._useLegacyLights===!0?Math.PI:1;n.lightMapIntensity.value=i.lightMapIntensity*o,e(i.lightMap,n.lightMapTransform)}i.aoMap&&(n.aoMap.value=i.aoMap,n.aoMapIntensity.value=i.aoMapIntensity,e(i.aoMap,n.aoMapTransform))}return{refreshFogUniforms:function(n,i){i.color.getRGB(n.fogColor.value,Hl(r)),i.isFog?(n.fogNear.value=i.near,n.fogFar.value=i.far):i.isFogExp2&&(n.fogDensity.value=i.density)},refreshMaterialUniforms:function(n,i,a,o,s){i.isMeshBasicMaterial||i.isMeshLambertMaterial?t(n,i):i.isMeshToonMaterial?(t(n,i),(function(l,c){c.gradientMap&&(l.gradientMap.value=c.gradientMap)})(n,i)):i.isMeshPhongMaterial?(t(n,i),(function(l,c){l.specular.value.copy(c.specular),l.shininess.value=Math.max(c.shininess,1e-4)})(n,i)):i.isMeshStandardMaterial?(t(n,i),(function(l,c){l.metalness.value=c.metalness,c.metalnessMap&&(l.metalnessMap.value=c.metalnessMap,e(c.metalnessMap,l.metalnessMapTransform)),l.roughness.value=c.roughness,c.roughnessMap&&(l.roughnessMap.value=c.roughnessMap,e(c.roughnessMap,l.roughnessMapTransform)),A.get(c).envMap&&(l.envMapIntensity.value=c.envMapIntensity)})(n,i),i.isMeshPhysicalMaterial&&(function(l,c,u){l.ior.value=c.ior,c.sheen>0&&(l.sheenColor.value.copy(c.sheenColor).multiplyScalar(c.sheen),l.sheenRoughness.value=c.sheenRoughness,c.sheenColorMap&&(l.sheenColorMap.value=c.sheenColorMap,e(c.sheenColorMap,l.sheenColorMapTransform)),c.sheenRoughnessMap&&(l.sheenRoughnessMap.value=c.sheenRoughnessMap,e(c.sheenRoughnessMap,l.sheenRoughnessMapTransform))),c.clearcoat>0&&(l.clearcoat.value=c.clearcoat,l.clearcoatRoughness.value=c.clearcoatRoughness,c.clearcoatMap&&(l.clearcoatMap.value=c.clearcoatMap,e(c.clearcoatMap,l.clearcoatMapTransform)),c.clearcoatRoughnessMap&&(l.clearcoatRoughnessMap.value=c.clearcoatRoughnessMap,e(c.clearcoatRoughnessMap,l.clearcoatRoughnessMapTransform)),c.clearcoatNormalMap&&(l.clearcoatNormalMap.value=c.clearcoatNormalMap,e(c.clearcoatNormalMap,l.clearcoatNormalMapTransform),l.clearcoatNormalScale.value.copy(c.clearcoatNormalScale),c.side===1&&l.clearcoatNormalScale.value.negate())),c.iridescence>0&&(l.iridescence.value=c.iridescence,l.iridescenceIOR.value=c.iridescenceIOR,l.iridescenceThicknessMinimum.value=c.iridescenceThicknessRange[0],l.iridescenceThicknessMaximum.value=c.iridescenceThicknessRange[1],c.iridescenceMap&&(l.iridescenceMap.value=c.iridescenceMap,e(c.iridescenceMap,l.iridescenceMapTransform)),c.iridescenceThicknessMap&&(l.iridescenceThicknessMap.value=c.iridescenceThicknessMap,e(c.iridescenceThicknessMap,l.iridescenceThicknessMapTransform))),c.transmission>0&&(l.transmission.value=c.transmission,l.transmissionSamplerMap.value=u.texture,l.transmissionSamplerSize.value.set(u.width,u.height),c.transmissionMap&&(l.transmissionMap.value=c.transmissionMap,e(c.transmissionMap,l.transmissionMapTransform)),l.thickness.value=c.thickness,c.thicknessMap&&(l.thicknessMap.value=c.thicknessMap,e(c.thicknessMap,l.thicknessMapTransform)),l.attenuationDistance.value=c.attenuationDistance,l.attenuationColor.value.copy(c.attenuationColor)),c.anisotropy>0&&(l.anisotropyVector.value.set(c.anisotropy*Math.cos(c.anisotropyRotation),c.anisotropy*Math.sin(c.anisotropyRotation)),c.anisotropyMap&&(l.anisotropyMap.value=c.anisotropyMap,e(c.anisotropyMap,l.anisotropyMapTransform))),l.specularIntensity.value=c.specularIntensity,l.specularColor.value.copy(c.specularColor),c.specularColorMap&&(l.specularColorMap.value=c.specularColorMap,e(c.specularColorMap,l.specularColorMapTransform)),c.specularIntensityMap&&(l.specularIntensityMap.value=c.specularIntensityMap,e(c.specularIntensityMap,l.specularIntensityMapTransform))})(n,i,s)):i.isMeshMatcapMaterial?(t(n,i),(function(l,c){c.matcap&&(l.matcap.value=c.matcap)})(n,i)):i.isMeshDepthMaterial?t(n,i):i.isMeshDistanceMaterial?(t(n,i),(function(l,c){const u=A.get(c).light;l.referencePosition.value.setFromMatrixPosition(u.matrixWorld),l.nearDistance.value=u.shadow.camera.near,l.farDistance.value=u.shadow.camera.far})(n,i)):i.isMeshNormalMaterial?t(n,i):i.isLineBasicMaterial?((function(l,c){l.diffuse.value.copy(c.color),l.opacity.value=c.opacity,c.map&&(l.map.value=c.map,e(c.map,l.mapTransform))})(n,i),i.isLineDashedMaterial&&(function(l,c){l.dashSize.value=c.dashSize,l.totalSize.value=c.dashSize+c.gapSize,l.scale.value=c.scale})(n,i)):i.isPointsMaterial?(function(l,c,u,h){l.diffuse.value.copy(c.color),l.opacity.value=c.opacity,l.size.value=c.size*u,l.scale.value=.5*h,c.map&&(l.map.value=c.map,e(c.map,l.uvTransform)),c.alphaMap&&(l.alphaMap.value=c.alphaMap,e(c.alphaMap,l.alphaMapTransform)),c.alphaTest>0&&(l.alphaTest.value=c.alphaTest)})(n,i,a,o):i.isSpriteMaterial?(function(l,c){l.diffuse.value.copy(c.color),l.opacity.value=c.opacity,l.rotation.value=c.rotation,c.map&&(l.map.value=c.map,e(c.map,l.mapTransform)),c.alphaMap&&(l.alphaMap.value=c.alphaMap,e(c.alphaMap,l.alphaMapTransform)),c.alphaTest>0&&(l.alphaTest.value=c.alphaTest)})(n,i):i.isShadowMaterial?(n.color.value.copy(i.color),n.opacity.value=i.opacity):i.isShaderMaterial&&(i.uniformsNeedUpdate=!1)}}}function ud(r,A,e,t){let n={},i={},a=[];const o=e.isWebGL2?r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS):0;function s(u,h,d,g){const m=u.value,f=h+"_"+d;if(g[f]===void 0)return g[f]=typeof m=="number"||typeof m=="boolean"?m:m.clone(),!0;{const v=g[f];if(typeof m=="number"||typeof m=="boolean"){if(v!==m)return g[f]=m,!0}else if(v.equals(m)===!1)return v.copy(m),!0}return!1}function l(u){const h={boundary:0,storage:0};return typeof u=="number"||typeof u=="boolean"?(h.boundary=4,h.storage=4):u.isVector2?(h.boundary=8,h.storage=8):u.isVector3||u.isColor?(h.boundary=16,h.storage=12):u.isVector4?(h.boundary=16,h.storage=16):u.isMatrix3?(h.boundary=48,h.storage=48):u.isMatrix4?(h.boundary=64,h.storage=64):u.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",u),h}function c(u){const h=u.target;h.removeEventListener("dispose",c);const d=a.indexOf(h.__bindingPointIndex);a.splice(d,1),r.deleteBuffer(n[h.id]),delete n[h.id],delete i[h.id]}return{bind:function(u,h){const d=h.program;t.uniformBlockBinding(u,d)},update:function(u,h){let d=n[u.id];d===void 0&&((function(f){const v=f.uniforms;let p=0;const B=16;for(let S=0,E=v.length;S<E;S++){const x=Array.isArray(v[S])?v[S]:[v[S]];for(let I=0,M=x.length;I<M;I++){const L=x[I],j=Array.isArray(L.value)?L.value:[L.value];for(let y=0,H=j.length;y<H;y++){const D=l(j[y]),AA=p%B;AA!==0&&B-AA<D.boundary&&(p+=B-AA),L.__data=new Float32Array(D.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=p,p+=D.storage}}}const T=p%B;T>0&&(p+=B-T),f.__size=p,f.__cache={}})(u),d=(function(f){const v=(function(){for(let S=0;S<o;S++)if(a.indexOf(S)===-1)return a.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0})();f.__bindingPointIndex=v;const p=r.createBuffer(),B=f.__size,T=f.usage;return r.bindBuffer(r.UNIFORM_BUFFER,p),r.bufferData(r.UNIFORM_BUFFER,B,T),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,v,p),p})(u),n[u.id]=d,u.addEventListener("dispose",c));const g=h.program;t.updateUBOMapping(u,g);const m=A.render.frame;i[u.id]!==m&&((function(f){const v=n[f.id],p=f.uniforms,B=f.__cache;r.bindBuffer(r.UNIFORM_BUFFER,v);for(let T=0,S=p.length;T<S;T++){const E=Array.isArray(p[T])?p[T]:[p[T]];for(let x=0,I=E.length;x<I;x++){const M=E[x];if(s(M,T,x,B)===!0){const L=M.__offset,j=Array.isArray(M.value)?M.value:[M.value];let y=0;for(let H=0;H<j.length;H++){const D=j[H],AA=l(D);typeof D=="number"||typeof D=="boolean"?(M.__data[0]=D,r.bufferSubData(r.UNIFORM_BUFFER,L+y,M.__data)):D.isMatrix3?(M.__data[0]=D.elements[0],M.__data[1]=D.elements[1],M.__data[2]=D.elements[2],M.__data[3]=0,M.__data[4]=D.elements[3],M.__data[5]=D.elements[4],M.__data[6]=D.elements[5],M.__data[7]=0,M.__data[8]=D.elements[6],M.__data[9]=D.elements[7],M.__data[10]=D.elements[8],M.__data[11]=0):(D.toArray(M.__data,y),y+=AA.storage/Float32Array.BYTES_PER_ELEMENT)}r.bufferSubData(r.UNIFORM_BUFFER,L,M.__data)}}}r.bindBuffer(r.UNIFORM_BUFFER,null)})(u),i[u.id]=m)},dispose:function(){for(const u in n)r.deleteBuffer(n[u]);a=[],n={},i={}}}}class zl{constructor(A={}){const{canvas:e=su(),context:t=null,depth:n=!0,stencil:i=!0,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:l=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:u=!1}=A;let h;this.isWebGLRenderer=!0,h=t!==null?t.getContextAttributes().alpha:a;const d=new Uint32Array(4),g=new Int32Array(4);let m=null,f=null;const v=[],p=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=YA,this._useLegacyLights=!1,this.toneMapping=0,this.toneMappingExposure=1;const B=this;let T=!1,S=0,E=0,x=null,I=-1,M=null;const L=new ZA,j=new ZA;let y=null;const H=new RA(0);let D=0,AA=e.width,iA=e.height,k=1,G=null,W=null;const R=new ZA(0,0,AA,iA),V=new ZA(0,0,AA,iA);let rA=!1;const w=new Ci;let _=!1,b=!1,O=null;const F=new CA,X=new TA,Z=new Q,q={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function tA(){return x===null?k:1}let cA,dA,C,aA,Y,K,eA,uA,hA,gA,wA,fA,pA,yA,he,mA,IA,MA,rn,Vt,nn,xe,_e,Kt,N=t;function an(U,P){for(let z=0;z<U.length;z++){const $=U[z],J=e.getContext($,P);if(J!==null)return J}return null}try{const U={alpha:!0,depth:n,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine","three.js r160"),e.addEventListener("webglcontextlost",Bs,!1),e.addEventListener("webglcontextrestored",vs,!1),e.addEventListener("webglcontextcreationerror",ws,!1),N===null){const P=["webgl2","webgl","experimental-webgl"];if(B.isWebGL1Renderer===!0&&P.shift(),N=an(P,U),N===null)throw an(P)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&N instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),N.getShaderPrecisionFormat===void 0&&(N.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(U){throw console.error("THREE.WebGLRenderer: "+U.message),U}function _r(){cA=new Du(N),dA=new Iu(N,cA,A),cA.init(dA),xe=new ad(N,cA,dA),C=new nd(N,cA,dA),aA=new Nu(N),Y=new Xh,K=new id(N,cA,C,Y,dA,xe,aA),eA=new Ru(B),uA=new Hu(B),hA=new Fu(N,dA),_e=new Qu(N,cA,hA,dA),gA=new Pu(N,hA,aA,_e),wA=new ku(N,gA,hA,aA),rn=new Ku(N,dA,K),mA=new Lu(Y),fA=new Wh(B,eA,uA,cA,dA,_e,mA),pA=new cd(B,Y),yA=new Jh,he=new Ad(cA,dA),MA=new Tu(B,eA,uA,C,wA,h,s),IA=new rd(B,wA,dA),Kt=new ud(N,aA,dA,C),Vt=new bu(N,cA,aA,dA),nn=new Ou(N,cA,aA,dA),aA.programs=fA.programs,B.capabilities=dA,B.extensions=cA,B.properties=Y,B.renderLists=yA,B.shadowMap=IA,B.state=C,B.info=aA}_r();const ie=new ld(B,N);function Bs(U){U.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function vs(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;const U=aA.autoReset,P=IA.enabled,z=IA.autoUpdate,$=IA.needsUpdate,J=IA.type;_r(),aA.autoReset=U,IA.enabled=P,IA.autoUpdate=z,IA.needsUpdate=$,IA.type=J}function ws(U){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",U.statusMessage)}function _s(U){const P=U.target;P.removeEventListener("dispose",_s),(function(z){(function($){const J=Y.get($).programs;J!==void 0&&(J.forEach((function(sA){fA.releaseProgram(sA)})),$.isShaderMaterial&&fA.releaseShaderCache($))})(z),Y.remove(z)})(P)}function Cs(U,P,z){U.transparent===!0&&U.side===2&&U.forceSinglePass===!1?(U.side=1,U.needsUpdate=!0,on(U,P,z),U.side=0,U.needsUpdate=!0,on(U,P,z),U.side=2):on(U,P,z)}this.xr=ie,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const U=cA.get("WEBGL_lose_context");U&&U.loseContext()},this.forceContextRestore=function(){const U=cA.get("WEBGL_lose_context");U&&U.restoreContext()},this.getPixelRatio=function(){return k},this.setPixelRatio=function(U){U!==void 0&&(k=U,this.setSize(AA,iA,!1))},this.getSize=function(U){return U.set(AA,iA)},this.setSize=function(U,P,z=!0){ie.isPresenting?console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting."):(AA=U,iA=P,e.width=Math.floor(U*k),e.height=Math.floor(P*k),z===!0&&(e.style.width=U+"px",e.style.height=P+"px"),this.setViewport(0,0,U,P))},this.getDrawingBufferSize=function(U){return U.set(AA*k,iA*k).floor()},this.setDrawingBufferSize=function(U,P,z){AA=U,iA=P,k=z,e.width=Math.floor(U*z),e.height=Math.floor(P*z),this.setViewport(0,0,U,P)},this.getCurrentViewport=function(U){return U.copy(L)},this.getViewport=function(U){return U.copy(R)},this.setViewport=function(U,P,z,$){U.isVector4?R.set(U.x,U.y,U.z,U.w):R.set(U,P,z,$),C.viewport(L.copy(R).multiplyScalar(k).floor())},this.getScissor=function(U){return U.copy(V)},this.setScissor=function(U,P,z,$){U.isVector4?V.set(U.x,U.y,U.z,U.w):V.set(U,P,z,$),C.scissor(j.copy(V).multiplyScalar(k).floor())},this.getScissorTest=function(){return rA},this.setScissorTest=function(U){C.setScissorTest(rA=U)},this.setOpaqueSort=function(U){G=U},this.setTransparentSort=function(U){W=U},this.getClearColor=function(U){return U.copy(MA.getClearColor())},this.setClearColor=function(){MA.setClearColor.apply(MA,arguments)},this.getClearAlpha=function(){return MA.getClearAlpha()},this.setClearAlpha=function(){MA.setClearAlpha.apply(MA,arguments)},this.clear=function(U=!0,P=!0,z=!0){let $=0;if(U){let J=!1;if(x!==null){const sA=x.texture.format;J=sA===1033||sA===1031||sA===1029}if(J){const sA=x.texture.type,BA=sA===1009||sA===1014||sA===1012||sA===1020||sA===1017||sA===1018,vA=MA.getClearColor(),EA=MA.getClearAlpha(),xA=vA.r,SA=vA.g,QA=vA.b;BA?(d[0]=xA,d[1]=SA,d[2]=QA,d[3]=EA,N.clearBufferuiv(N.COLOR,0,d)):(g[0]=xA,g[1]=SA,g[2]=QA,g[3]=EA,N.clearBufferiv(N.COLOR,0,g))}else $|=N.COLOR_BUFFER_BIT}P&&($|=N.DEPTH_BUFFER_BIT),z&&($|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Bs,!1),e.removeEventListener("webglcontextrestored",vs,!1),e.removeEventListener("webglcontextcreationerror",ws,!1),yA.dispose(),he.dispose(),Y.dispose(),eA.dispose(),uA.dispose(),wA.dispose(),_e.dispose(),Kt.dispose(),fA.dispose(),ie.dispose(),ie.removeEventListener("sessionstart",Es),ie.removeEventListener("sessionend",Us),O&&(O.dispose(),O=null),Et.stop()},this.renderBufferDirect=function(U,P,z,$,J,sA){P===null&&(P=q);const BA=J.isMesh&&J.matrixWorld.determinant()<0,vA=(function(qA,ye,pe,bA,LA){ye.isScene!==!0&&(ye=q),K.resetTextureUnits();const Cr=ye.fog,Hi=bA.isMeshStandardMaterial?ye.environment:null,qc=x===null?B.outputColorSpace:x.isXRRenderTarget===!0?x.texture.colorSpace:it,ln=(bA.isMeshStandardMaterial?uA:eA).get(bA.envMap||Hi),jc=bA.vertexColors===!0&&!!pe.attributes.color&&pe.attributes.color.itemSize===4,$c=!!pe.attributes.tangent&&(!!bA.normalMap||bA.anisotropy>0),Au=!!pe.morphAttributes.position,eu=!!pe.morphAttributes.normal,tu=!!pe.morphAttributes.color;let Ts=0;bA.toneMapped&&(x!==null&&x.isXRRenderTarget!==!0||(Ts=B.toneMapping));const Qs=pe.morphAttributes.position||pe.morphAttributes.normal||pe.morphAttributes.color,ru=Qs!==void 0?Qs.length:0,HA=Y.get(bA),nu=f.state.lights;if(_===!0&&(b===!0||qA!==M)){const Me=qA===M&&bA.id===I;mA.setState(bA,qA,Me)}let He=!1;bA.version===HA.__version?HA.needsLights&&HA.lightsStateVersion!==nu.state.version||HA.outputColorSpace!==qc||LA.isBatchedMesh&&HA.batching===!1?He=!0:LA.isBatchedMesh||HA.batching!==!0?LA.isInstancedMesh&&HA.instancing===!1?He=!0:LA.isInstancedMesh||HA.instancing!==!0?LA.isSkinnedMesh&&HA.skinning===!1?He=!0:LA.isSkinnedMesh||HA.skinning!==!0?LA.isInstancedMesh&&HA.instancingColor===!0&&LA.instanceColor===null||LA.isInstancedMesh&&HA.instancingColor===!1&&LA.instanceColor!==null||HA.envMap!==ln||bA.fog===!0&&HA.fog!==Cr?He=!0:HA.numClippingPlanes===void 0||HA.numClippingPlanes===mA.numPlanes&&HA.numIntersection===mA.numIntersection?(HA.vertexAlphas!==jc||HA.vertexTangents!==$c||HA.morphTargets!==Au||HA.morphNormals!==eu||HA.morphColors!==tu||HA.toneMapping!==Ts||dA.isWebGL2===!0&&HA.morphTargetsCount!==ru)&&(He=!0):He=!0:He=!0:He=!0:He=!0:(He=!0,HA.__version=bA.version);let xt=HA.currentProgram;He===!0&&(xt=on(bA,ye,LA));let bs=!1,Er=!1,Di=!1;const ae=xt.getUniforms(),yt=HA.uniforms;if(C.useProgram(xt.program)&&(bs=!0,Er=!0,Di=!0),bA.id!==I&&(I=bA.id,Er=!0),bs||M!==qA){ae.setValue(N,"projectionMatrix",qA.projectionMatrix),ae.setValue(N,"viewMatrix",qA.matrixWorldInverse);const Me=ae.map.cameraPosition;Me!==void 0&&Me.setValue(N,Z.setFromMatrixPosition(qA.matrixWorld)),dA.logarithmicDepthBuffer&&ae.setValue(N,"logDepthBufFC",2/(Math.log(qA.far+1)/Math.LN2)),(bA.isMeshPhongMaterial||bA.isMeshToonMaterial||bA.isMeshLambertMaterial||bA.isMeshBasicMaterial||bA.isMeshStandardMaterial||bA.isShaderMaterial)&&ae.setValue(N,"isOrthographic",qA.isOrthographicCamera===!0),M!==qA&&(M=qA,Er=!0,Di=!0)}if(LA.isSkinnedMesh){ae.setOptional(N,LA,"bindMatrix"),ae.setOptional(N,LA,"bindMatrixInverse");const Me=LA.skeleton;Me&&(dA.floatVertexTextures?(Me.boneTexture===null&&Me.computeBoneTexture(),ae.setValue(N,"boneTexture",Me.boneTexture,K)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}LA.isBatchedMesh&&(ae.setOptional(N,LA,"batchingTexture"),ae.setValue(N,"batchingTexture",LA._matricesTexture,K));const Pi=pe.morphAttributes;(Pi.position!==void 0||Pi.normal!==void 0||Pi.color!==void 0&&dA.isWebGL2===!0)&&rn.update(LA,pe,xt),(Er||HA.receiveShadow!==LA.receiveShadow)&&(HA.receiveShadow=LA.receiveShadow,ae.setValue(N,"receiveShadow",LA.receiveShadow)),bA.isMeshGouraudMaterial&&bA.envMap!==null&&(yt.envMap.value=ln,yt.flipEnvMap.value=ln.isCubeTexture&&ln.isRenderTargetTexture===!1?-1:1),Er&&(ae.setValue(N,"toneMappingExposure",B.toneMappingExposure),HA.needsLights&&(De=Di,(ke=yt).ambientLightColor.needsUpdate=De,ke.lightProbe.needsUpdate=De,ke.directionalLights.needsUpdate=De,ke.directionalLightShadows.needsUpdate=De,ke.pointLights.needsUpdate=De,ke.pointLightShadows.needsUpdate=De,ke.spotLights.needsUpdate=De,ke.spotLightShadows.needsUpdate=De,ke.rectAreaLights.needsUpdate=De,ke.hemisphereLights.needsUpdate=De),Cr&&bA.fog===!0&&pA.refreshFogUniforms(yt,Cr),pA.refreshMaterialUniforms(yt,bA,k,iA,O),ei.upload(N,Ss(HA),yt,K));var ke,De;if(bA.isShaderMaterial&&bA.uniformsNeedUpdate===!0&&(ei.upload(N,Ss(HA),yt,K),bA.uniformsNeedUpdate=!1),bA.isSpriteMaterial&&ae.setValue(N,"center",LA.center),ae.setValue(N,"modelViewMatrix",LA.modelViewMatrix),ae.setValue(N,"normalMatrix",LA.normalMatrix),ae.setValue(N,"modelMatrix",LA.matrixWorld),bA.isShaderMaterial||bA.isRawShaderMaterial){const Me=bA.uniformsGroups;for(let Oi=0,iu=Me.length;Oi<iu;Oi++)if(dA.isWebGL2){const Is=Me[Oi];Kt.update(Is,xt),Kt.bind(Is,xt)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return xt})(U,P,z,$,J);C.setMaterial($,BA);let EA=z.index,xA=1;if($.wireframe===!0){if(EA=gA.getWireframeAttribute(z),EA===void 0)return;xA=2}const SA=z.drawRange,QA=z.attributes.position;let KA=SA.start*xA,Re=(SA.start+SA.count)*xA;sA!==null&&(KA=Math.max(KA,sA.start*xA),Re=Math.min(Re,(sA.start+sA.count)*xA)),EA!==null?(KA=Math.max(KA,0),Re=Math.min(Re,EA.count)):QA!=null&&(KA=Math.max(KA,0),Re=Math.min(Re,QA.count));const Ze=Re-KA;if(Ze<0||Ze===1/0)return;let Ut;_e.setup(J,$,vA,z,EA);let kA=Vt;if(EA!==null&&(Ut=hA.get(EA),kA=nn,kA.setIndex(Ut)),J.isMesh)$.wireframe===!0?(C.setLineWidth($.wireframeLinewidth*tA()),kA.setMode(N.LINES)):kA.setMode(N.TRIANGLES);else if(J.isLine){let qA=$.linewidth;qA===void 0&&(qA=1),C.setLineWidth(qA*tA()),J.isLineSegments?kA.setMode(N.LINES):J.isLineLoop?kA.setMode(N.LINE_LOOP):kA.setMode(N.LINE_STRIP)}else J.isPoints?kA.setMode(N.POINTS):J.isSprite&&kA.setMode(N.TRIANGLES);if(J.isBatchedMesh)kA.renderMultiDraw(J._multiDrawStarts,J._multiDrawCounts,J._multiDrawCount);else if(J.isInstancedMesh)kA.renderInstances(KA,Ze,J.count);else if(z.isInstancedBufferGeometry){const qA=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,ye=Math.min(z.instanceCount,qA);kA.renderInstances(KA,Ze,ye)}else kA.render(KA,Ze)},this.compile=function(U,P,z=null){z===null&&(z=U),f=he.get(z),f.init(),p.push(f),z.traverseVisible((function(J){J.isLight&&J.layers.test(P.layers)&&(f.pushLight(J),J.castShadow&&f.pushShadow(J))})),U!==z&&U.traverseVisible((function(J){J.isLight&&J.layers.test(P.layers)&&(f.pushLight(J),J.castShadow&&f.pushShadow(J))})),f.setupLights(B._useLegacyLights);const $=new Set;return U.traverse((function(J){const sA=J.material;if(sA)if(Array.isArray(sA))for(let BA=0;BA<sA.length;BA++){const vA=sA[BA];Cs(vA,z,J),$.add(vA)}else Cs(sA,z,J),$.add(sA)})),p.pop(),f=null,$},this.compileAsync=function(U,P,z=null){const $=this.compile(U,P,z);return new Promise((J=>{function sA(){$.forEach((function(BA){Y.get(BA).currentProgram.isReady()&&$.delete(BA)})),$.size!==0?setTimeout(sA,10):J(U)}cA.get("KHR_parallel_shader_compile")!==null?sA():setTimeout(sA,10)}))};let Ri=null;function Es(){Et.stop()}function Us(){Et.start()}const Et=new Pl;function xs(U,P,z,$){if(U.visible===!1)return;if(U.layers.test(P.layers)){if(U.isGroup)z=U.renderOrder;else if(U.isLOD)U.autoUpdate===!0&&U.update(P);else if(U.isLight)f.pushLight(U),U.castShadow&&f.pushShadow(U);else if(U.isSprite){if(!U.frustumCulled||w.intersectsSprite(U)){$&&Z.setFromMatrixPosition(U.matrixWorld).applyMatrix4(F);const sA=wA.update(U),BA=U.material;BA.visible&&m.push(U,sA,BA,z,Z.z,null)}}else if((U.isMesh||U.isLine||U.isPoints)&&(!U.frustumCulled||w.intersectsObject(U))){const sA=wA.update(U),BA=U.material;if($&&(U.boundingSphere!==void 0?(U.boundingSphere===null&&U.computeBoundingSphere(),Z.copy(U.boundingSphere.center)):(sA.boundingSphere===null&&sA.computeBoundingSphere(),Z.copy(sA.boundingSphere.center)),Z.applyMatrix4(U.matrixWorld).applyMatrix4(F)),Array.isArray(BA)){const vA=sA.groups;for(let EA=0,xA=vA.length;EA<xA;EA++){const SA=vA[EA],QA=BA[SA.materialIndex];QA&&QA.visible&&m.push(U,sA,QA,z,Z.z,SA)}}else BA.visible&&m.push(U,sA,BA,z,Z.z,null)}}const J=U.children;for(let sA=0,BA=J.length;sA<BA;sA++)xs(J[sA],P,z,$)}function ys(U,P,z,$){const J=U.opaque,sA=U.transmissive,BA=U.transparent;f.setupLightsView(z),_===!0&&mA.setGlobalState(B.clippingPlanes,z),sA.length>0&&(function(vA,EA,xA,SA){if((xA.isScene===!0?xA.overrideMaterial:null)!==null)return;const KA=dA.isWebGL2;O===null&&(O=new Ot(1,1,{generateMipmaps:!0,type:cA.has("EXT_color_buffer_half_float")?1016:1009,minFilter:1008,samples:KA?4:0})),B.getDrawingBufferSize(X),KA?O.setSize(X.x,X.y):O.setSize(Ra(X.x),Ra(X.y));const Re=B.getRenderTarget();B.setRenderTarget(O),B.getClearColor(H),D=B.getClearAlpha(),D<1&&B.setClearColor(16777215,.5),B.clear();const Ze=B.toneMapping;B.toneMapping=0,sn(vA,xA,SA),K.updateMultisampleRenderTarget(O),K.updateRenderTargetMipmap(O);let Ut=!1;for(let kA=0,qA=EA.length;kA<qA;kA++){const ye=EA[kA],pe=ye.object,bA=ye.geometry,LA=ye.material,Cr=ye.group;if(LA.side===2&&pe.layers.test(SA.layers)){const Hi=LA.side;LA.side=1,LA.needsUpdate=!0,Ms(pe,xA,SA,bA,LA,Cr),LA.side=Hi,LA.needsUpdate=!0,Ut=!0}}Ut===!0&&(K.updateMultisampleRenderTarget(O),K.updateRenderTargetMipmap(O)),B.setRenderTarget(Re),B.setClearColor(H,D),B.toneMapping=Ze})(J,sA,P,z),$&&C.viewport(L.copy($)),J.length>0&&sn(J,P,z),sA.length>0&&sn(sA,P,z),BA.length>0&&sn(BA,P,z),C.buffers.depth.setTest(!0),C.buffers.depth.setMask(!0),C.buffers.color.setMask(!0),C.setPolygonOffset(!1)}function sn(U,P,z){const $=P.isScene===!0?P.overrideMaterial:null;for(let J=0,sA=U.length;J<sA;J++){const BA=U[J],vA=BA.object,EA=BA.geometry,xA=$===null?BA.material:$,SA=BA.group;vA.layers.test(z.layers)&&Ms(vA,P,z,EA,xA,SA)}}function Ms(U,P,z,$,J,sA){U.onBeforeRender(B,P,z,$,J,sA),U.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,U.matrixWorld),U.normalMatrix.getNormalMatrix(U.modelViewMatrix),J.onBeforeRender(B,P,z,$,U,sA),J.transparent===!0&&J.side===2&&J.forceSinglePass===!1?(J.side=1,J.needsUpdate=!0,B.renderBufferDirect(z,P,$,J,U,sA),J.side=0,J.needsUpdate=!0,B.renderBufferDirect(z,P,$,J,U,sA),J.side=2):B.renderBufferDirect(z,P,$,J,U,sA),U.onAfterRender(B,P,z,$,J,sA)}function on(U,P,z){P.isScene!==!0&&(P=q);const $=Y.get(U),J=f.state.lights,sA=f.state.shadowsArray,BA=J.state.version,vA=fA.getParameters(U,J.state,sA,P,z),EA=fA.getProgramCacheKey(vA);let xA=$.programs;$.environment=U.isMeshStandardMaterial?P.environment:null,$.fog=P.fog,$.envMap=(U.isMeshStandardMaterial?uA:eA).get(U.envMap||$.environment),xA===void 0&&(U.addEventListener("dispose",_s),xA=new Map,$.programs=xA);let SA=xA.get(EA);if(SA!==void 0){if($.currentProgram===SA&&$.lightsStateVersion===BA)return Fs(U,vA),SA}else vA.uniforms=fA.getUniforms(U),U.onBuild(z,vA,B),U.onBeforeCompile(vA,B),SA=fA.acquireProgram(vA,EA),xA.set(EA,SA),$.uniforms=vA.uniforms;const QA=$.uniforms;return(U.isShaderMaterial||U.isRawShaderMaterial)&&U.clipping!==!0||(QA.clippingPlanes=mA.uniform),Fs(U,vA),$.needsLights=(function(KA){return KA.isMeshLambertMaterial||KA.isMeshToonMaterial||KA.isMeshPhongMaterial||KA.isMeshStandardMaterial||KA.isShadowMaterial||KA.isShaderMaterial&&KA.lights===!0})(U),$.lightsStateVersion=BA,$.needsLights&&(QA.ambientLightColor.value=J.state.ambient,QA.lightProbe.value=J.state.probe,QA.directionalLights.value=J.state.directional,QA.directionalLightShadows.value=J.state.directionalShadow,QA.spotLights.value=J.state.spot,QA.spotLightShadows.value=J.state.spotShadow,QA.rectAreaLights.value=J.state.rectArea,QA.ltc_1.value=J.state.rectAreaLTC1,QA.ltc_2.value=J.state.rectAreaLTC2,QA.pointLights.value=J.state.point,QA.pointLightShadows.value=J.state.pointShadow,QA.hemisphereLights.value=J.state.hemi,QA.directionalShadowMap.value=J.state.directionalShadowMap,QA.directionalShadowMatrix.value=J.state.directionalShadowMatrix,QA.spotShadowMap.value=J.state.spotShadowMap,QA.spotLightMatrix.value=J.state.spotLightMatrix,QA.spotLightMap.value=J.state.spotLightMap,QA.pointShadowMap.value=J.state.pointShadowMap,QA.pointShadowMatrix.value=J.state.pointShadowMatrix),$.currentProgram=SA,$.uniformsList=null,SA}function Ss(U){if(U.uniformsList===null){const P=U.currentProgram.getUniforms();U.uniformsList=ei.seqWithValue(P.seq,U.uniforms)}return U.uniformsList}function Fs(U,P){const z=Y.get(U);z.outputColorSpace=P.outputColorSpace,z.batching=P.batching,z.instancing=P.instancing,z.instancingColor=P.instancingColor,z.skinning=P.skinning,z.morphTargets=P.morphTargets,z.morphNormals=P.morphNormals,z.morphColors=P.morphColors,z.morphTargetsCount=P.morphTargetsCount,z.numClippingPlanes=P.numClippingPlanes,z.numIntersection=P.numClipIntersection,z.vertexAlphas=P.vertexAlphas,z.vertexTangents=P.vertexTangents,z.toneMapping=P.toneMapping}Et.setAnimationLoop((function(U){Ri&&Ri(U)})),typeof self<"u"&&Et.setContext(self),this.setAnimationLoop=function(U){Ri=U,ie.setAnimationLoop(U),U===null?Et.stop():Et.start()},ie.addEventListener("sessionstart",Es),ie.addEventListener("sessionend",Us),this.render=function(U,P){if(P!==void 0&&P.isCamera!==!0)return void console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");if(T===!0)return;U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),P.parent===null&&P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),ie.enabled===!0&&ie.isPresenting===!0&&(ie.cameraAutoUpdate===!0&&ie.updateCamera(P),P=ie.getCamera()),U.isScene===!0&&U.onBeforeRender(B,U,P,x),f=he.get(U,p.length),f.init(),p.push(f),F.multiplyMatrices(P.projectionMatrix,P.matrixWorldInverse),w.setFromProjectionMatrix(F),b=this.localClippingEnabled,_=mA.init(this.clippingPlanes,b),m=yA.get(U,v.length),m.init(),v.push(m),xs(U,P,0,B.sortObjects),m.finish(),B.sortObjects===!0&&m.sort(G,W),this.info.render.frame++,_===!0&&mA.beginShadows();const z=f.state.shadowsArray;if(IA.render(z,U,P),_===!0&&mA.endShadows(),this.info.autoReset===!0&&this.info.reset(),MA.render(m,U),f.setupLights(B._useLegacyLights),P.isArrayCamera){const $=P.cameras;for(let J=0,sA=$.length;J<sA;J++){const BA=$[J];ys(m,U,BA,BA.viewport)}}else ys(m,U,P);x!==null&&(K.updateMultisampleRenderTarget(x),K.updateRenderTargetMipmap(x)),U.isScene===!0&&U.onAfterRender(B,U,P),_e.resetDefaultState(),I=-1,M=null,p.pop(),f=p.length>0?p[p.length-1]:null,v.pop(),m=v.length>0?v[v.length-1]:null},this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return x},this.setRenderTargetTextures=function(U,P,z){Y.get(U.texture).__webglTexture=P,Y.get(U.depthTexture).__webglTexture=z;const $=Y.get(U);$.__hasExternalTextures=!0,$.__hasExternalTextures&&($.__autoAllocateDepthBuffer=z===void 0,$.__autoAllocateDepthBuffer||cA.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),$.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(U,P){const z=Y.get(U);z.__webglFramebuffer=P,z.__useDefaultFramebuffer=P===void 0},this.setRenderTarget=function(U,P=0,z=0){x=U,S=P,E=z;let $=!0,J=null,sA=!1,BA=!1;if(U){const vA=Y.get(U);vA.__useDefaultFramebuffer!==void 0?(C.bindFramebuffer(N.FRAMEBUFFER,null),$=!1):vA.__webglFramebuffer===void 0?K.setupRenderTarget(U):vA.__hasExternalTextures&&K.rebindTextures(U,Y.get(U.texture).__webglTexture,Y.get(U.depthTexture).__webglTexture);const EA=U.texture;(EA.isData3DTexture||EA.isDataArrayTexture||EA.isCompressedArrayTexture)&&(BA=!0);const xA=Y.get(U).__webglFramebuffer;U.isWebGLCubeRenderTarget?(J=Array.isArray(xA[P])?xA[P][z]:xA[P],sA=!0):J=dA.isWebGL2&&U.samples>0&&K.useMultisampledRTT(U)===!1?Y.get(U).__webglMultisampledFramebuffer:Array.isArray(xA)?xA[z]:xA,L.copy(U.viewport),j.copy(U.scissor),y=U.scissorTest}else L.copy(R).multiplyScalar(k).floor(),j.copy(V).multiplyScalar(k).floor(),y=rA;if(C.bindFramebuffer(N.FRAMEBUFFER,J)&&dA.drawBuffers&&$&&C.drawBuffers(U,J),C.viewport(L),C.scissor(j),C.setScissorTest(y),sA){const vA=Y.get(U.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+P,vA.__webglTexture,z)}else if(BA){const vA=Y.get(U.texture),EA=P||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,vA.__webglTexture,z||0,EA)}I=-1},this.readRenderTargetPixels=function(U,P,z,$,J,sA,BA){if(!U||!U.isWebGLRenderTarget)return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let vA=Y.get(U).__webglFramebuffer;if(U.isWebGLCubeRenderTarget&&BA!==void 0&&(vA=vA[BA]),vA){C.bindFramebuffer(N.FRAMEBUFFER,vA);try{const EA=U.texture,xA=EA.format,SA=EA.type;if(xA!==1023&&xe.convert(xA)!==N.getParameter(N.IMPLEMENTATION_COLOR_READ_FORMAT))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");const QA=SA===1016&&(cA.has("EXT_color_buffer_half_float")||dA.isWebGL2&&cA.has("EXT_color_buffer_float"));if(!(SA===1009||xe.convert(SA)===N.getParameter(N.IMPLEMENTATION_COLOR_READ_TYPE)||SA===1015&&(dA.isWebGL2||cA.has("OES_texture_float")||cA.has("WEBGL_color_buffer_float"))||QA))return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");P>=0&&P<=U.width-$&&z>=0&&z<=U.height-J&&N.readPixels(P,z,$,J,xe.convert(xA),xe.convert(SA),sA)}finally{const EA=x!==null?Y.get(x).__webglFramebuffer:null;C.bindFramebuffer(N.FRAMEBUFFER,EA)}}},this.copyFramebufferToTexture=function(U,P,z=0){const $=Math.pow(2,-z),J=Math.floor(P.image.width*$),sA=Math.floor(P.image.height*$);K.setTexture2D(P,0),N.copyTexSubImage2D(N.TEXTURE_2D,z,0,0,U.x,U.y,J,sA),C.unbindTexture()},this.copyTextureToTexture=function(U,P,z,$=0){const J=P.image.width,sA=P.image.height,BA=xe.convert(z.format),vA=xe.convert(z.type);K.setTexture2D(z,0),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,z.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,z.unpackAlignment),P.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,$,U.x,U.y,J,sA,BA,vA,P.image.data):P.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,$,U.x,U.y,P.mipmaps[0].width,P.mipmaps[0].height,BA,P.mipmaps[0].data):N.texSubImage2D(N.TEXTURE_2D,$,U.x,U.y,BA,vA,P.image),$===0&&z.generateMipmaps&&N.generateMipmap(N.TEXTURE_2D),C.unbindTexture()},this.copyTextureToTexture3D=function(U,P,z,$,J=0){if(B.isWebGL1Renderer)return void console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");const sA=U.max.x-U.min.x+1,BA=U.max.y-U.min.y+1,vA=U.max.z-U.min.z+1,EA=xe.convert($.format),xA=xe.convert($.type);let SA;if($.isData3DTexture)K.setTexture3D($,0),SA=N.TEXTURE_3D;else{if(!$.isDataArrayTexture&&!$.isCompressedArrayTexture)return void console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");K.setTexture2DArray($,0),SA=N.TEXTURE_2D_ARRAY}N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,$.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,$.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,$.unpackAlignment);const QA=N.getParameter(N.UNPACK_ROW_LENGTH),KA=N.getParameter(N.UNPACK_IMAGE_HEIGHT),Re=N.getParameter(N.UNPACK_SKIP_PIXELS),Ze=N.getParameter(N.UNPACK_SKIP_ROWS),Ut=N.getParameter(N.UNPACK_SKIP_IMAGES),kA=z.isCompressedTexture?z.mipmaps[J]:z.image;N.pixelStorei(N.UNPACK_ROW_LENGTH,kA.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,kA.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,U.min.x),N.pixelStorei(N.UNPACK_SKIP_ROWS,U.min.y),N.pixelStorei(N.UNPACK_SKIP_IMAGES,U.min.z),z.isDataTexture||z.isData3DTexture?N.texSubImage3D(SA,J,P.x,P.y,P.z,sA,BA,vA,EA,xA,kA.data):z.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),N.compressedTexSubImage3D(SA,J,P.x,P.y,P.z,sA,BA,vA,EA,kA.data)):N.texSubImage3D(SA,J,P.x,P.y,P.z,sA,BA,vA,EA,xA,kA),N.pixelStorei(N.UNPACK_ROW_LENGTH,QA),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,KA),N.pixelStorei(N.UNPACK_SKIP_PIXELS,Re),N.pixelStorei(N.UNPACK_SKIP_ROWS,Ze),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Ut),J===0&&$.generateMipmaps&&N.generateMipmap(SA),C.unbindTexture()},this.initTexture=function(U){U.isCubeTexture?K.setTextureCube(U,0):U.isData3DTexture?K.setTexture3D(U,0):U.isDataArrayTexture||U.isCompressedArrayTexture?K.setTexture2DArray(U,0):K.setTexture2D(U,0),C.unbindTexture()},this.resetState=function(){S=0,E=0,x=null,C.reset(),_e.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return 2e3}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(A){this._outputColorSpace=A;const e=this.getContext();e.drawingBufferColorSpace=A===as?"display-p3":"srgb",e.unpackColorSpace=PA.workingColorSpace===vi?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===YA?3001:3e3}set outputEncoding(A){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=A===3001?YA:it}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(A){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=A}}class hd extends zl{}hd.prototype.isWebGL1Renderer=!0;class dd extends ue{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(A,e){return super.copy(A,e),A.background!==null&&(this.background=A.background.clone()),A.environment!==null&&(this.environment=A.environment.clone()),A.fog!==null&&(this.fog=A.fog.clone()),this.backgroundBlurriness=A.backgroundBlurriness,this.backgroundIntensity=A.backgroundIntensity,A.overrideMaterial!==null&&(this.overrideMaterial=A.overrideMaterial.clone()),this.matrixAutoUpdate=A.matrixAutoUpdate,this}toJSON(A){const e=super.toJSON(A);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e}}new Q;new Q;new Q;new Q;new TA;new TA;new CA;new Q;new Q;new Q;new TA;new TA;new TA;new Q;new Q;new Q;new ZA;new ZA;new Q;new CA;new Q;new Ct;new CA;new wi;new CA;new CA;new CA;new CA;new _t;new CA;new be;new Ct;new CA;new CA;new CA;new CA;new Ci;new _t;new Ct;new Q;new be;new Q;new Q;new CA;new wi;new Ct;new Q;new Q;new CA;new wi;new Ct;new Q;class _o extends we{constructor(A,e,t,n,i,a,o,s,l){super(A,e,t,n,i,a,o,s,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}new Q;new Q;new Q;new Q;new Te;class Co extends $r{constructor(A){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new RA(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new RA(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new TA(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(A)}copy(A){return super.copy(A),this.defines={STANDARD:""},this.color.copy(A.color),this.roughness=A.roughness,this.metalness=A.metalness,this.map=A.map,this.lightMap=A.lightMap,this.lightMapIntensity=A.lightMapIntensity,this.aoMap=A.aoMap,this.aoMapIntensity=A.aoMapIntensity,this.emissive.copy(A.emissive),this.emissiveMap=A.emissiveMap,this.emissiveIntensity=A.emissiveIntensity,this.bumpMap=A.bumpMap,this.bumpScale=A.bumpScale,this.normalMap=A.normalMap,this.normalMapType=A.normalMapType,this.normalScale.copy(A.normalScale),this.displacementMap=A.displacementMap,this.displacementScale=A.displacementScale,this.displacementBias=A.displacementBias,this.roughnessMap=A.roughnessMap,this.metalnessMap=A.metalnessMap,this.alphaMap=A.alphaMap,this.envMap=A.envMap,this.envMapIntensity=A.envMapIntensity,this.wireframe=A.wireframe,this.wireframeLinewidth=A.wireframeLinewidth,this.wireframeLinecap=A.wireframeLinecap,this.wireframeLinejoin=A.wireframeLinejoin,this.flatShading=A.flatShading,this.fog=A.fog,this}}class Wl extends ue{constructor(A,e=1){super(),this.isLight=!0,this.type="Light",this.color=new RA(A),this.intensity=e}dispose(){}copy(A,e){return super.copy(A,e),this.color.copy(A.color),this.intensity=A.intensity,this}toJSON(A){const e=super.toJSON(A);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),e}}const ua=new CA,Eo=new Q,Uo=new Q;class fd{constructor(A){this.camera=A,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new TA(512,512),this.map=null,this.mapPass=null,this.matrix=new CA,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ci,this._frameExtents=new TA(1,1),this._viewportCount=1,this._viewports=[new ZA(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(A){const e=this.camera,t=this.matrix;Eo.setFromMatrixPosition(A.matrixWorld),e.position.copy(Eo),Uo.setFromMatrixPosition(A.target.matrixWorld),e.lookAt(Uo),e.updateMatrixWorld(),ua.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ua),t.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),t.multiply(ua)}getViewport(A){return this._viewports[A]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(A){return this.camera=A.camera.clone(),this.bias=A.bias,this.radius=A.radius,this.mapSize.copy(A.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const A={};return this.bias!==0&&(A.bias=this.bias),this.normalBias!==0&&(A.normalBias=this.normalBias),this.radius!==1&&(A.radius=this.radius),this.mapSize.x===512&&this.mapSize.y===512||(A.mapSize=this.mapSize.toArray()),A.camera=this.camera.toJSON(!1).object,delete A.camera.matrix,A}}new CA;new Q;new Q;class pd extends fd{constructor(){super(new os(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class xo extends Wl{constructor(A,e){super(A,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ue.DEFAULT_UP),this.updateMatrix(),this.target=new ue,this.shadow=new pd}dispose(){this.shadow.dispose()}copy(A){return super.copy(A),this.target=A.target.clone(),this.shadow=A.shadow.clone(),this}}class gd extends Wl{constructor(A,e){super(A,e),this.isAmbientLight=!0,this.type="AmbientLight"}}new CA;new CA;new CA;new Q;new Q;new Q;new Q;new Q;new Q;const Xl="\\[\\]\\.:\\/",ha="[^"+Xl+"]",md="[^"+Xl.replace("\\.","")+"]";new RegExp("^"+/((?:WC+[\/:])*)/.source.replace("WC",ha)+/(WCOD+)?/.source.replace("WCOD",md)+/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ha)+/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ha)+"$");new TA;new Q;new Q;new Q;new Q;new CA;new CA;new Q;new RA;new RA;new Q;new Q;new Q;new Q;new ss;new _t;new Q;typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var Da=function(r,A){return Da=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])},Da(r,A)};function Ke(r,A){if(typeof A!="function"&&A!==null)throw new TypeError("Class extends value "+String(A)+" is not a constructor or null");Da(r,A);function e(){this.constructor=r}r.prototype=A===null?Object.create(A):(e.prototype=A.prototype,new e)}var Pa=function(){return Pa=Object.assign||function(A){for(var e,t=1,n=arguments.length;t<n;t++){e=arguments[t];for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(A[i]=e[i])}return A},Pa.apply(this,arguments)};function fe(r,A,e,t){function n(i){return i instanceof e?i:new e(function(a){a(i)})}return new(e||(e=Promise))(function(i,a){function o(c){try{l(t.next(c))}catch(u){a(u)}}function s(c){try{l(t.throw(c))}catch(u){a(u)}}function l(c){c.done?i(c.value):n(c.value).then(o,s)}l((t=t.apply(r,[])).next())})}function le(r,A){var e={label:0,sent:function(){if(i[0]&1)throw i[1];return i[1]},trys:[],ops:[]},t,n,i,a;return a={next:o(0),throw:o(1),return:o(2)},typeof Symbol=="function"&&(a[Symbol.iterator]=function(){return this}),a;function o(l){return function(c){return s([l,c])}}function s(l){if(t)throw new TypeError("Generator is already executing.");for(;e;)try{if(t=1,n&&(i=l[0]&2?n.return:l[0]?n.throw||((i=n.return)&&i.call(n),0):n.next)&&!(i=i.call(n,l[1])).done)return i;switch(n=0,i&&(l=[l[0]&2,i.value]),l[0]){case 0:case 1:i=l;break;case 4:return e.label++,{value:l[1],done:!1};case 5:e.label++,n=l[1],l=[0];continue;case 7:l=e.ops.pop(),e.trys.pop();continue;default:if(i=e.trys,!(i=i.length>0&&i[i.length-1])&&(l[0]===6||l[0]===2)){e=0;continue}if(l[0]===3&&(!i||l[1]>i[0]&&l[1]<i[3])){e.label=l[1];break}if(l[0]===6&&e.label<i[1]){e.label=i[1],i=l;break}if(i&&e.label<i[2]){e.label=i[2],e.ops.push(l);break}i[2]&&e.ops.pop(),e.trys.pop();continue}l=A.call(r,e)}catch(c){l=[6,c],n=0}finally{t=i=0}if(l[0]&5)throw l[1];return{value:l[0]?l[1]:void 0,done:!0}}}function bn(r,A,e){if(arguments.length===2)for(var t=0,n=A.length,i;t<n;t++)(i||!(t in A))&&(i||(i=Array.prototype.slice.call(A,0,t)),i[t]=A[t]);return r.concat(i||A)}var at=(function(){function r(A,e,t,n){this.left=A,this.top=e,this.width=t,this.height=n}return r.prototype.add=function(A,e,t,n){return new r(this.left+A,this.top+e,this.width+t,this.height+n)},r.fromClientRect=function(A,e){return new r(e.left+A.windowBounds.left,e.top+A.windowBounds.top,e.width,e.height)},r.fromDOMRectList=function(A,e){var t=Array.from(e).find(function(n){return n.width!==0});return t?new r(t.left+A.windowBounds.left,t.top+A.windowBounds.top,t.width,t.height):r.EMPTY},r.EMPTY=new r(0,0,0,0),r})(),xi=function(r,A){return at.fromClientRect(r,A.getBoundingClientRect())},Bd=function(r){var A=r.body,e=r.documentElement;if(!A||!e)throw new Error("Unable to get document size");var t=Math.max(Math.max(A.scrollWidth,e.scrollWidth),Math.max(A.offsetWidth,e.offsetWidth),Math.max(A.clientWidth,e.clientWidth)),n=Math.max(Math.max(A.scrollHeight,e.scrollHeight),Math.max(A.offsetHeight,e.offsetHeight),Math.max(A.clientHeight,e.clientHeight));return new at(0,0,t,n)},yi=function(r){for(var A=[],e=0,t=r.length;e<t;){var n=r.charCodeAt(e++);if(n>=55296&&n<=56319&&e<t){var i=r.charCodeAt(e++);(i&64512)===56320?A.push(((n&1023)<<10)+(i&1023)+65536):(A.push(n),e--)}else A.push(n)}return A},WA=function(){for(var r=[],A=0;A<arguments.length;A++)r[A]=arguments[A];if(String.fromCodePoint)return String.fromCodePoint.apply(String,r);var e=r.length;if(!e)return"";for(var t=[],n=-1,i="";++n<e;){var a=r[n];a<=65535?t.push(a):(a-=65536,t.push((a>>10)+55296,a%1024+56320)),(n+1===e||t.length>16384)&&(i+=String.fromCharCode.apply(String,t),t.length=0)}return i},yo="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",vd=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(var In=0;In<yo.length;In++)vd[yo.charCodeAt(In)]=In;var Mo="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Rr=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(var Ln=0;Ln<Mo.length;Ln++)Rr[Mo.charCodeAt(Ln)]=Ln;var wd=function(r){var A=r.length*.75,e=r.length,t,n=0,i,a,o,s;r[r.length-1]==="="&&(A--,r[r.length-2]==="="&&A--);var l=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u"&&typeof Uint8Array.prototype.slice<"u"?new ArrayBuffer(A):new Array(A),c=Array.isArray(l)?l:new Uint8Array(l);for(t=0;t<e;t+=4)i=Rr[r.charCodeAt(t)],a=Rr[r.charCodeAt(t+1)],o=Rr[r.charCodeAt(t+2)],s=Rr[r.charCodeAt(t+3)],c[n++]=i<<2|a>>4,c[n++]=(a&15)<<4|o>>2,c[n++]=(o&3)<<6|s&63;return l},_d=function(r){for(var A=r.length,e=[],t=0;t<A;t+=2)e.push(r[t+1]<<8|r[t]);return e},Cd=function(r){for(var A=r.length,e=[],t=0;t<A;t+=4)e.push(r[t+3]<<24|r[t+2]<<16|r[t+1]<<8|r[t]);return e},Dt=5,cs=11,da=2,Ed=cs-Dt,Yl=65536>>Dt,Ud=1<<Dt,fa=Ud-1,xd=1024>>Dt,yd=Yl+xd,Md=yd,Sd=32,Fd=Md+Sd,Td=65536>>cs,Qd=1<<Ed,bd=Qd-1,So=function(r,A,e){return r.slice?r.slice(A,e):new Uint16Array(Array.prototype.slice.call(r,A,e))},Id=function(r,A,e){return r.slice?r.slice(A,e):new Uint32Array(Array.prototype.slice.call(r,A,e))},Ld=function(r,A){var e=wd(r),t=Array.isArray(e)?Cd(e):new Uint32Array(e),n=Array.isArray(e)?_d(e):new Uint16Array(e),i=24,a=So(n,i/2,t[4]/2),o=t[5]===2?So(n,(i+t[4])/2):Id(t,Math.ceil((i+t[4])/4));return new Rd(t[0],t[1],t[2],t[3],a,o)},Rd=(function(){function r(A,e,t,n,i,a){this.initialValue=A,this.errorValue=e,this.highStart=t,this.highValueIndex=n,this.index=i,this.data=a}return r.prototype.get=function(A){var e;if(A>=0){if(A<55296||A>56319&&A<=65535)return e=this.index[A>>Dt],e=(e<<da)+(A&fa),this.data[e];if(A<=65535)return e=this.index[Yl+(A-55296>>Dt)],e=(e<<da)+(A&fa),this.data[e];if(A<this.highStart)return e=Fd-Td+(A>>cs),e=this.index[e],e+=A>>Dt&bd,e=this.index[e],e=(e<<da)+(A&fa),this.data[e];if(A<=1114111)return this.data[this.highValueIndex]}return this.errorValue},r})(),Fo="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Hd=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(var Rn=0;Rn<Fo.length;Rn++)Hd[Fo.charCodeAt(Rn)]=Rn;var Dd="KwAAAAAAAAAACA4AUD0AADAgAAACAAAAAAAIABAAGABAAEgAUABYAGAAaABgAGgAYgBqAF8AZwBgAGgAcQB5AHUAfQCFAI0AlQCdAKIAqgCyALoAYABoAGAAaABgAGgAwgDKAGAAaADGAM4A0wDbAOEA6QDxAPkAAQEJAQ8BFwF1AH0AHAEkASwBNAE6AUIBQQFJAVEBWQFhAWgBcAF4ATAAgAGGAY4BlQGXAZ8BpwGvAbUBvQHFAc0B0wHbAeMB6wHxAfkBAQIJAvEBEQIZAiECKQIxAjgCQAJGAk4CVgJeAmQCbAJ0AnwCgQKJApECmQKgAqgCsAK4ArwCxAIwAMwC0wLbAjAA4wLrAvMC+AIAAwcDDwMwABcDHQMlAy0DNQN1AD0DQQNJA0kDSQNRA1EDVwNZA1kDdQB1AGEDdQBpA20DdQN1AHsDdQCBA4kDkQN1AHUAmQOhA3UAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AKYDrgN1AHUAtgO+A8YDzgPWAxcD3gPjA+sD8wN1AHUA+wMDBAkEdQANBBUEHQQlBCoEFwMyBDgEYABABBcDSARQBFgEYARoBDAAcAQzAXgEgASIBJAEdQCXBHUAnwSnBK4EtgS6BMIEyAR1AHUAdQB1AHUAdQCVANAEYABgAGAAYABgAGAAYABgANgEYADcBOQEYADsBPQE/AQEBQwFFAUcBSQFLAU0BWQEPAVEBUsFUwVbBWAAYgVgAGoFcgV6BYIFigWRBWAAmQWfBaYFYABgAGAAYABgAKoFYACxBbAFuQW6BcEFwQXHBcEFwQXPBdMF2wXjBeoF8gX6BQIGCgYSBhoGIgYqBjIGOgZgAD4GRgZMBmAAUwZaBmAAYABgAGAAYABgAGAAYABgAGAAYABgAGIGYABpBnAGYABgAGAAYABgAGAAYABgAGAAYAB4Bn8GhQZgAGAAYAB1AHcDFQSLBmAAYABgAJMGdQA9A3UAmwajBqsGqwaVALMGuwbDBjAAywbSBtIG1QbSBtIG0gbSBtIG0gbdBuMG6wbzBvsGAwcLBxMHAwcbByMHJwcsBywHMQcsB9IGOAdAB0gHTgfSBkgHVgfSBtIG0gbSBtIG0gbSBtIG0gbSBiwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdgAGAALAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdbB2MHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB2kH0gZwB64EdQB1AHUAdQB1AHUAdQB1AHUHfQdgAIUHjQd1AHUAlQedB2AAYAClB6sHYACzB7YHvgfGB3UAzgfWBzMB3gfmB1EB7gf1B/0HlQENAQUIDQh1ABUIHQglCBcDLQg1CD0IRQhNCEEDUwh1AHUAdQBbCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIcAh3CHoIMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIgggwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAALAcsBywHLAcsBywHLAcsBywHLAcsB4oILAcsB44I0gaWCJ4Ipgh1AHUAqgiyCHUAdQB1AHUAdQB1AHUAdQB1AHUAtwh8AXUAvwh1AMUIyQjRCNkI4AjoCHUAdQB1AO4I9gj+CAYJDgkTCS0HGwkjCYIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiAAIAAAAFAAYABgAGIAXwBgAHEAdQBFAJUAogCyAKAAYABgAEIA4ABGANMA4QDxAMEBDwE1AFwBLAE6AQEBUQF4QkhCmEKoQrhCgAHIQsAB0MLAAcABwAHAAeDC6ABoAHDCwMMAAcABwAHAAdDDGMMAAcAB6MM4wwjDWMNow3jDaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAEjDqABWw6bDqABpg6gAaABoAHcDvwOPA+gAaABfA/8DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DpcPAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcAB9cPKwkyCToJMAB1AHUAdQBCCUoJTQl1AFUJXAljCWcJawkwADAAMAAwAHMJdQB2CX4JdQCECYoJjgmWCXUAngkwAGAAYABxAHUApgn3A64JtAl1ALkJdQDACTAAMAAwADAAdQB1AHUAdQB1AHUAdQB1AHUAowYNBMUIMAAwADAAMADICcsJ0wnZCRUE4QkwAOkJ8An4CTAAMAB1AAAKvwh1AAgKDwoXCh8KdQAwACcKLgp1ADYKqAmICT4KRgowADAAdQB1AE4KMAB1AFYKdQBeCnUAZQowADAAMAAwADAAMAAwADAAMAAVBHUAbQowADAAdQC5CXUKMAAwAHwBxAijBogEMgF9CoQKiASMCpQKmgqIBKIKqgquCogEDQG2Cr4KxgrLCjAAMADTCtsKCgHjCusK8Qr5CgELMAAwADAAMAB1AIsECQsRC3UANAEZCzAAMAAwADAAMAB1ACELKQswAHUANAExCzkLdQBBC0kLMABRC1kLMAAwADAAMAAwADAAdQBhCzAAMAAwAGAAYABpC3ELdwt/CzAAMACHC4sLkwubC58Lpwt1AK4Ltgt1APsDMAAwADAAMAAwADAAMAAwAL4LwwvLC9IL1wvdCzAAMADlC+kL8Qv5C/8LSQswADAAMAAwADAAMAAwADAAMAAHDDAAMAAwADAAMAAODBYMHgx1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1ACYMMAAwADAAdQB1AHUALgx1AHUAdQB1AHUAdQA2DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AD4MdQBGDHUAdQB1AHUAdQB1AEkMdQB1AHUAdQB1AFAMMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQBYDHUAdQB1AF8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUA+wMVBGcMMAAwAHwBbwx1AHcMfwyHDI8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAYABgAJcMMAAwADAAdQB1AJ8MlQClDDAAMACtDCwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB7UMLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AA0EMAC9DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAsBywHLAcsBywHLAcsBywHLQcwAMEMyAwsBywHLAcsBywHLAcsBywHLAcsBywHzAwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1ANQM2QzhDDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMABgAGAAYABgAGAAYABgAOkMYADxDGAA+AwADQYNYABhCWAAYAAODTAAMAAwADAAFg1gAGAAHg37AzAAMAAwADAAYABgACYNYAAsDTQNPA1gAEMNPg1LDWAAYABgAGAAYABgAGAAYABgAGAAUg1aDYsGVglhDV0NcQBnDW0NdQ15DWAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAlQCBDZUAiA2PDZcNMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAnw2nDTAAMAAwADAAMAAwAHUArw23DTAAMAAwADAAMAAwADAAMAAwADAAMAB1AL8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQDHDTAAYABgAM8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA1w11ANwNMAAwAD0B5A0wADAAMAAwADAAMADsDfQN/A0EDgwOFA4wABsOMAAwADAAMAAwADAAMAAwANIG0gbSBtIG0gbSBtIG0gYjDigOwQUuDsEFMw7SBjoO0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGQg5KDlIOVg7SBtIGXg5lDm0OdQ7SBtIGfQ6EDooOjQ6UDtIGmg6hDtIG0gaoDqwO0ga0DrwO0gZgAGAAYADEDmAAYAAkBtIGzA5gANIOYADaDokO0gbSBt8O5w7SBu8O0gb1DvwO0gZgAGAAxA7SBtIG0gbSBtIGYABgAGAAYAAED2AAsAUMD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHJA8sBywHLAcsBywHLAccDywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywPLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAc0D9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHPA/SBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gYUD0QPlQCVAJUAMAAwADAAMACVAJUAlQCVAJUAlQCVAEwPMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA//8EAAQABAAEAAQABAAEAAQABAANAAMAAQABAAIABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQACgATABcAHgAbABoAHgAXABYAEgAeABsAGAAPABgAHABLAEsASwBLAEsASwBLAEsASwBLABgAGAAeAB4AHgATAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYAGwASAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWAA0AEQAeAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAFAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJABYAGgAbABsAGwAeAB0AHQAeAE8AFwAeAA0AHgAeABoAGwBPAE8ADgBQAB0AHQAdAE8ATwAXAE8ATwBPABYAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAFAATwBAAE8ATwBPAEAATwBQAFAATwBQAB4AHgAeAB4AHgAeAB0AHQAdAB0AHgAdAB4ADgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgBQAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkACQAJAAkACQAJAAkABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAFAAHgAeAB4AKwArAFAAUABQAFAAGABQACsAKwArACsAHgAeAFAAHgBQAFAAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUAAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAYAA0AKwArAB4AHgAbACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAB4ABAAEAB4ABAAEABMABAArACsAKwArACsAKwArACsAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAKwArACsAKwBWAFYAVgBWAB4AHgArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AGgAaABoAGAAYAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQAEwAEACsAEwATAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABLAEsASwBLAEsASwBLAEsASwBLABoAGQAZAB4AUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABMAUAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABABQAFAABAAEAB4ABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUAAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAFAABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQAUABQAB4AHgAYABMAUAArACsABAAbABsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAFAABAAEAAQABAAEAFAABAAEAAQAUAAEAAQABAAEAAQAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArACsAHgArAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAUAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEAA0ADQBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUAArACsAKwBQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABABQACsAKwArACsAKwArACsAKwAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUAAaABoAUABQAFAAUABQAEwAHgAbAFAAHgAEACsAKwAEAAQABAArAFAAUABQAFAAUABQACsAKwArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQACsAUABQACsAKwAEACsABAAEAAQABAAEACsAKwArACsABAAEACsAKwAEAAQABAArACsAKwAEACsAKwArACsAKwArACsAUABQAFAAUAArAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLAAQABABQAFAAUAAEAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAArACsAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AGwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAKwArACsAKwArAAQABAAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAAQAUAArAFAAUABQAFAAUABQACsAKwArAFAAUABQACsAUABQAFAAUAArACsAKwBQAFAAKwBQACsAUABQACsAKwArAFAAUAArACsAKwBQAFAAUAArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAAQABAAEAAQABAArACsAKwAEAAQABAArAAQABAAEAAQAKwArAFAAKwArACsAKwArACsABAArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAHgAeAB4AHgAeAB4AGwAeACsAKwArACsAKwAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAUABQAFAAKwArACsAKwArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwAOAFAAUABQAFAAUABQAFAAHgBQAAQABAAEAA4AUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAKwArAAQAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAKwArACsAKwArACsAUAArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABABQAB4AKwArACsAKwBQAFAAUAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQABoAUABQAFAAUABQAFAAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQACsAUAArACsAUABQAFAAUABQAFAAUAArACsAKwAEACsAKwArACsABAAEAAQABAAEAAQAKwAEACsABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgAqACsAKwArACsAGwBcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAeAEsASwBLAEsASwBLAEsASwBLAEsADQANACsAKwArACsAKwBcAFwAKwBcACsAXABcAFwAXABcACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAXAArAFwAXABcAFwAXABcAFwAXABcAFwAKgBcAFwAKgAqACoAKgAqACoAKgAqACoAXAArACsAXABcAFwAXABcACsAXAArACoAKgAqACoAKgAqACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwBcAFwAXABcAFAADgAOAA4ADgAeAA4ADgAJAA4ADgANAAkAEwATABMAEwATAAkAHgATAB4AHgAeAAQABAAeAB4AHgAeAB4AHgBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQAFAADQAEAB4ABAAeAAQAFgARABYAEQAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAAQABAAEAAQADQAEAAQAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAA0ADQAeAB4AHgAeAB4AHgAEAB4AHgAeAB4AHgAeACsAHgAeAA4ADgANAA4AHgAeAB4AHgAeAAkACQArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgBcAEsASwBLAEsASwBLAEsASwBLAEsADQANAB4AHgAeAB4AXABcAFwAXABcAFwAKgAqACoAKgBcAFwAXABcACoAKgAqAFwAKgAqACoAXABcACoAKgAqACoAKgAqACoAXABcAFwAKgAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqAFwAKgBLAEsASwBLAEsASwBLAEsASwBLACoAKgAqACoAKgAqAFAAUABQAFAAUABQACsAUAArACsAKwArACsAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAKwBQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsABAAEAAQAHgANAB4AHgAeAB4AHgAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUAArACsADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWABEAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQANAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAANAA0AKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUAArAAQABAArACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqAA0ADQAVAFwADQAeAA0AGwBcACoAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwAeAB4AEwATAA0ADQAOAB4AEwATAB4ABAAEAAQACQArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAHgArACsAKwATABMASwBLAEsASwBLAEsASwBLAEsASwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAXABcAFwAXABcACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAXAArACsAKwAqACoAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsAHgAeAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKwAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKwArAAQASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACoAKgAqACoAKgAqACoAXAAqACoAKgAqACoAKgArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABABQAFAAUABQAFAAUABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwANAA0AHgANAA0ADQANAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwAeAB4AHgAeAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArAA0ADQANAA0ADQBLAEsASwBLAEsASwBLAEsASwBLACsAKwArAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUAAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAAQAUABQAFAAUABQAFAABABQAFAABAAEAAQAUAArACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQACsAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQACsAKwAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQACsAHgAeAB4AHgAeAB4AHgAOAB4AKwANAA0ADQANAA0ADQANAAkADQANAA0ACAAEAAsABAAEAA0ACQANAA0ADAAdAB0AHgAXABcAFgAXABcAFwAWABcAHQAdAB4AHgAUABQAFAANAAEAAQAEAAQABAAEAAQACQAaABoAGgAaABoAGgAaABoAHgAXABcAHQAVABUAHgAeAB4AHgAeAB4AGAAWABEAFQAVABUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ADQAeAA0ADQANAA0AHgANAA0ADQAHAB4AHgAeAB4AKwAEAAQABAAEAAQABAAEAAQABAAEAFAAUAArACsATwBQAFAAUABQAFAAHgAeAB4AFgARAE8AUABPAE8ATwBPAFAAUABQAFAAUAAeAB4AHgAWABEAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArABsAGwAbABsAGwAbABsAGgAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGgAbABsAGwAbABoAGwAbABoAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAHgAeAFAAGgAeAB0AHgBQAB4AGgAeAB4AHgAeAB4AHgAeAB4AHgBPAB4AUAAbAB4AHgBQAFAAUABQAFAAHgAeAB4AHQAdAB4AUAAeAFAAHgBQAB4AUABPAFAAUAAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgBQAFAAUABQAE8ATwBQAFAAUABQAFAATwBQAFAATwBQAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAUABQAFAATwBPAE8ATwBPAE8ATwBPAE8ATwBQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABPAB4AHgArACsAKwArAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHQAdAB4AHgAeAB0AHQAeAB4AHQAeAB4AHgAdAB4AHQAbABsAHgAdAB4AHgAeAB4AHQAeAB4AHQAdAB0AHQAeAB4AHQAeAB0AHgAdAB0AHQAdAB0AHQAeAB0AHgAeAB4AHgAeAB0AHQAdAB0AHgAeAB4AHgAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB0AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAdAB0AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAWABEAHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AHQAdAB0AHgAeAB0AHgAeAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlAB4AHQAdAB4AHgAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AJQAlAB0AHQAlAB4AJQAlACUAIAAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAdAB0AHQAeAB0AJQAdAB0AHgAdAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAdAB0AHQAdACUAHgAlACUAJQAdACUAJQAdAB0AHQAlACUAHQAdACUAHQAdACUAJQAlAB4AHQAeAB4AHgAeAB0AHQAlAB0AHQAdAB0AHQAdACUAJQAlACUAJQAdACUAJQAgACUAHQAdACUAJQAlACUAJQAlACUAJQAeAB4AHgAlACUAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AFwAXABcAFwAXABcAHgATABMAJQAeAB4AHgAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARABYAEQAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAeAB4AKwArACsAKwArABMADQANAA0AUAATAA0AUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUAANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAA0ADQANAA0ADQANAA0ADQAeAA0AFgANAB4AHgAXABcAHgAeABcAFwAWABEAFgARABYAEQAWABEADQANAA0ADQATAFAADQANAB4ADQANAB4AHgAeAB4AHgAMAAwADQANAA0AHgANAA0AFgANAA0ADQANAA0ADQANAA0AHgANAB4ADQANAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArAA0AEQARACUAJQBHAFcAVwAWABEAFgARABYAEQAWABEAFgARACUAJQAWABEAFgARABYAEQAWABEAFQAWABEAEQAlAFcAVwBXAFcAVwBXAFcAVwBXAAQABAAEAAQABAAEACUAVwBXAFcAVwA2ACUAJQBXAFcAVwBHAEcAJQAlACUAKwBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBRAFcAUQBXAFEAVwBXAFcAVwBXAFcAUQBXAFcAVwBXAFcAVwBRAFEAKwArAAQABAAVABUARwBHAFcAFQBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBRAFcAVwBXAFcAVwBXAFEAUQBXAFcAVwBXABUAUQBHAEcAVwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwAlACUAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACsAKwArACsAKwArACsAKwArACsAKwArAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBPAE8ATwBPAE8ATwBPAE8AJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADQATAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQAHgBQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAeAA0ADQANAA0ADQArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAAQAUABQAFAABABQAFAAUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAeAB4AHgAeAAQAKwArACsAUABQAFAAUABQAFAAHgAeABoAHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADgAOABMAEwArACsAKwArACsAKwArACsABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUAAeAB4AHgBQAA4AUABQAAQAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAB4AWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYACsAKwArAAQAHgAeAB4AHgAeAB4ADQANAA0AHgAeAB4AHgArAFAASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArAB4AHgBcAFwAXABcAFwAKgBcAFwAXABcAFwAXABcAFwAXABcAEsASwBLAEsASwBLAEsASwBLAEsAXABcAFwAXABcACsAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAFAAUABQAAQAUABQAFAAUABQAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAHgANAA0ADQBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAKgAqACoAXABcACoAKgBcAFwAXABcAFwAKgAqAFwAKgBcACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAA0ADQBQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQADQAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAVABVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBUAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVACsAKwArACsAKwArACsAKwArACsAKwArAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAKwArACsAKwBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAKwArACsAKwAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArACsAKwArAFYABABWAFYAVgBWAFYAVgBWAFYAVgBWAB4AVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgArAFYAVgBWAFYAVgArAFYAKwBWAFYAKwBWAFYAKwBWAFYAVgBWAFYAVgBWAFYAVgBWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAEQAWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAaAB4AKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAGAARABEAGAAYABMAEwAWABEAFAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACUAJQAlACUAJQAWABEAFgARABYAEQAWABEAFgARABYAEQAlACUAFgARACUAJQAlACUAJQAlACUAEQAlABEAKwAVABUAEwATACUAFgARABYAEQAWABEAJQAlACUAJQAlACUAJQAlACsAJQAbABoAJQArACsAKwArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAcAKwATACUAJQAbABoAJQAlABYAEQAlACUAEQAlABEAJQBXAFcAVwBXAFcAVwBXAFcAVwBXABUAFQAlACUAJQATACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXABYAJQARACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAWACUAEQAlABYAEQARABYAEQARABUAVwBRAFEAUQBRAFEAUQBRAFEAUQBRAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcARwArACsAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXACsAKwBXAFcAVwBXAFcAVwArACsAVwBXAFcAKwArACsAGgAbACUAJQAlABsAGwArAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAAQAB0AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsADQANAA0AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAA0AUABQAFAAUAArACsAKwArAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwBQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAUABQAFAAUABQAAQABAAEACsABAAEACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAKwBQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAA0ADQANAA0ADQANAA0ADQAeACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAArACsAKwArAFAAUABQAFAAUAANAA0ADQANAA0ADQAUACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsADQANAA0ADQANAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArAAQABAANACsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAB4AHgAeAB4AHgArACsAKwArACsAKwAEAAQABAAEAAQABAAEAA0ADQAeAB4AHgAeAB4AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsASwBLAEsASwBLAEsASwBLAEsASwANAA0ADQANAFAABAAEAFAAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAeAA4AUAArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAADQANAB4ADQAEAAQABAAEAB4ABAAEAEsASwBLAEsASwBLAEsASwBLAEsAUAAOAFAADQANAA0AKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAA0AHgANAA0AHgAEACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAA0AKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsABAAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAUAArACsAKwArACsAKwAEACsAKwArACsAKwBQAFAAUABQAFAABAAEACsAKwAEAAQABAAEAAQABAAEACsAKwArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABABQAFAAUABQAA0ADQANAA0AHgBLAEsASwBLAEsASwBLAEsASwBLAA0ADQArAB4ABABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUAAeAFAAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABAAEAAQADgANAA0AEwATAB4AHgAeAA0ADQANAA0ADQANAA0ADQANAA0ADQANAA0ADQANAFAAUABQAFAABAAEACsAKwAEAA0ADQAeAFAAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKwArACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBcAFwADQANAA0AKgBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQAKwAEAAQAKwArAAQABAAEAAQAUAAEAFAABAAEAA0ADQANACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABABQAA4AUAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAOAB4ADQANAA0ADQAOAB4ABAArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA0ADQANAFAADgAOAA4ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAFAADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAOABMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAArACsAKwAEACsABAAEACsABAAEAAQABAAEAAQABABQAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAaABoAGgAaAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABIAEgAQwBDAEMAUABQAFAAUABDAFAAUABQAEgAQwBIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABDAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAJAAkACQAJAAkACQAJABYAEQArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwANAA0AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAANACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQANAB4AHgAeAB4AHgAeAFAAUABQAFAADQAeACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAA0AHgAeACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAARwBHABUARwAJACsAKwArACsAKwArACsAKwArACsAKwAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUQBRAFEAKwArACsAKwArACsAKwArACsAKwArACsAKwBRAFEAUQBRACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAHgAEAAQADQAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQABAAEAAQABAAeAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQAHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAKwArAFAAKwArAFAAUAArACsAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUAArAFAAUABQAFAAUABQAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAHgAeAFAAUABQAFAAUAArAFAAKwArACsAUABQAFAAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeACsAKwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4ABAAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAHgAeAA0ADQANAA0AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArAAQABAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwBQAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArABsAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAB4AHgAeAB4ABAAEAAQABAAEAAQABABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArABYAFgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAGgBQAFAAUAAaAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUAArACsAKwArACsAKwBQACsAKwArACsAUAArAFAAKwBQACsAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUAArAFAAKwBQACsAUAArAFAAUAArAFAAKwArAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAKwBQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AJQAlACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeACUAJQAlAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAlACUAJQAlACUAHgAlACUAJQAlACUAIAAgACAAJQAlACAAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACEAIQAhACEAIQAlACUAIAAgACUAJQAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAIAAlACUAJQAlACAAIAAgACUAIAAgACAAJQAlACUAJQAlACUAJQAgACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAlAB4AJQAeACUAJQAlACUAJQAgACUAJQAlACUAHgAlAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACAAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABcAFwAXABUAFQAVAB4AHgAeAB4AJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAgACUAJQAgACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAIAAgACUAJQAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACAAIAAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACAAIAAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAA==",To=50,Pd=1,Jl=2,Zl=3,Od=4,Nd=5,Qo=7,ql=8,bo=9,pt=10,Oa=11,Io=12,Na=13,Gd=14,Hr=15,Ga=16,Hn=17,Tr=18,Vd=19,Lo=20,Va=21,Qr=22,pa=23,ir=24,Ue=25,Dr=26,Pr=27,ar=28,Kd=29,Lt=30,kd=31,Dn=32,Pn=33,Ka=34,ka=35,za=36,Yr=37,Wa=38,ti=39,ri=40,ga=41,jl=42,zd=43,Wd=[9001,65288],$l="!",FA="×",On="÷",Xa=Ld(Dd),tt=[Lt,za],Ya=[Pd,Jl,Zl,Nd],Ac=[pt,ql],Ro=[Pr,Dr],Xd=Ya.concat(Ac),Ho=[Wa,ti,ri,Ka,ka],Yd=[Hr,Na],Jd=function(r,A){A===void 0&&(A="strict");var e=[],t=[],n=[];return r.forEach(function(i,a){var o=Xa.get(i);if(o>To?(n.push(!0),o-=To):n.push(!1),["normal","auto","loose"].indexOf(A)!==-1&&[8208,8211,12316,12448].indexOf(i)!==-1)return t.push(a),e.push(Ga);if(o===Od||o===Oa){if(a===0)return t.push(a),e.push(Lt);var s=e[a-1];return Xd.indexOf(s)===-1?(t.push(t[a-1]),e.push(s)):(t.push(a),e.push(Lt))}if(t.push(a),o===kd)return e.push(A==="strict"?Va:Yr);if(o===jl||o===Kd)return e.push(Lt);if(o===zd)return i>=131072&&i<=196605||i>=196608&&i<=262141?e.push(Yr):e.push(Lt);e.push(o)}),[t,e,n]},ma=function(r,A,e,t){var n=t[e];if(Array.isArray(r)?r.indexOf(n)!==-1:r===n)for(var i=e;i<=t.length;){i++;var a=t[i];if(a===A)return!0;if(a!==pt)break}if(n===pt)for(var i=e;i>0;){i--;var o=t[i];if(Array.isArray(r)?r.indexOf(o)!==-1:r===o)for(var s=e;s<=t.length;){s++;var a=t[s];if(a===A)return!0;if(a!==pt)break}if(o!==pt)break}return!1},Do=function(r,A){for(var e=r;e>=0;){var t=A[e];if(t===pt)e--;else return t}return 0},Zd=function(r,A,e,t,n){if(e[t]===0)return FA;var i=t-1;if(Array.isArray(n)&&n[i]===!0)return FA;var a=i-1,o=i+1,s=A[i],l=a>=0?A[a]:0,c=A[o];if(s===Jl&&c===Zl)return FA;if(Ya.indexOf(s)!==-1)return $l;if(Ya.indexOf(c)!==-1||Ac.indexOf(c)!==-1)return FA;if(Do(i,A)===ql)return On;if(Xa.get(r[i])===Oa||(s===Dn||s===Pn)&&Xa.get(r[o])===Oa||s===Qo||c===Qo||s===bo||[pt,Na,Hr].indexOf(s)===-1&&c===bo||[Hn,Tr,Vd,ir,ar].indexOf(c)!==-1||Do(i,A)===Qr||ma(pa,Qr,i,A)||ma([Hn,Tr],Va,i,A)||ma(Io,Io,i,A))return FA;if(s===pt)return On;if(s===pa||c===pa)return FA;if(c===Ga||s===Ga)return On;if([Na,Hr,Va].indexOf(c)!==-1||s===Gd||l===za&&Yd.indexOf(s)!==-1||s===ar&&c===za||c===Lo||tt.indexOf(c)!==-1&&s===Ue||tt.indexOf(s)!==-1&&c===Ue||s===Pr&&[Yr,Dn,Pn].indexOf(c)!==-1||[Yr,Dn,Pn].indexOf(s)!==-1&&c===Dr||tt.indexOf(s)!==-1&&Ro.indexOf(c)!==-1||Ro.indexOf(s)!==-1&&tt.indexOf(c)!==-1||[Pr,Dr].indexOf(s)!==-1&&(c===Ue||[Qr,Hr].indexOf(c)!==-1&&A[o+1]===Ue)||[Qr,Hr].indexOf(s)!==-1&&c===Ue||s===Ue&&[Ue,ar,ir].indexOf(c)!==-1)return FA;if([Ue,ar,ir,Hn,Tr].indexOf(c)!==-1)for(var u=i;u>=0;){var h=A[u];if(h===Ue)return FA;if([ar,ir].indexOf(h)!==-1)u--;else break}if([Pr,Dr].indexOf(c)!==-1)for(var u=[Hn,Tr].indexOf(s)!==-1?a:i;u>=0;){var h=A[u];if(h===Ue)return FA;if([ar,ir].indexOf(h)!==-1)u--;else break}if(Wa===s&&[Wa,ti,Ka,ka].indexOf(c)!==-1||[ti,Ka].indexOf(s)!==-1&&[ti,ri].indexOf(c)!==-1||[ri,ka].indexOf(s)!==-1&&c===ri||Ho.indexOf(s)!==-1&&[Lo,Dr].indexOf(c)!==-1||Ho.indexOf(c)!==-1&&s===Pr||tt.indexOf(s)!==-1&&tt.indexOf(c)!==-1||s===ir&&tt.indexOf(c)!==-1||tt.concat(Ue).indexOf(s)!==-1&&c===Qr&&Wd.indexOf(r[o])===-1||tt.concat(Ue).indexOf(c)!==-1&&s===Tr)return FA;if(s===ga&&c===ga){for(var d=e[i],g=1;d>0&&(d--,A[d]===ga);)g++;if(g%2!==0)return FA}return s===Dn&&c===Pn?FA:On},qd=function(r,A){A||(A={lineBreak:"normal",wordBreak:"normal"});var e=Jd(r,A.lineBreak),t=e[0],n=e[1],i=e[2];(A.wordBreak==="break-all"||A.wordBreak==="break-word")&&(n=n.map(function(o){return[Ue,Lt,jl].indexOf(o)!==-1?Yr:o}));var a=A.wordBreak==="keep-all"?i.map(function(o,s){return o&&r[s]>=19968&&r[s]<=40959}):void 0;return[t,n,a]},jd=(function(){function r(A,e,t,n){this.codePoints=A,this.required=e===$l,this.start=t,this.end=n}return r.prototype.slice=function(){return WA.apply(void 0,this.codePoints.slice(this.start,this.end))},r})(),$d=function(r,A){var e=yi(r),t=qd(e,A),n=t[0],i=t[1],a=t[2],o=e.length,s=0,l=0;return{next:function(){if(l>=o)return{done:!0,value:null};for(var c=FA;l<o&&(c=Zd(e,i,n,++l,a))===FA;);if(c!==FA||l===o){var u=new jd(e,c,s,l);return s=l,{value:u,done:!1}}return{done:!0,value:null}}}},Af=1,ef=2,en=4,Po=8,li=10,Oo=47,Kr=92,tf=9,rf=32,Nn=34,br=61,nf=35,af=36,sf=37,Gn=39,Vn=40,Ir=41,of=95,Be=45,lf=33,cf=60,uf=62,hf=64,df=91,ff=93,pf=61,gf=123,Kn=63,mf=125,No=124,Bf=126,vf=128,Go=65533,Ba=42,Rt=43,wf=44,_f=58,Cf=59,Jr=46,Ef=0,Uf=8,xf=11,yf=14,Mf=31,Sf=127,ze=-1,ec=48,tc=97,rc=101,Ff=102,Tf=117,Qf=122,nc=65,ic=69,ac=70,bf=85,If=90,ce=function(r){return r>=ec&&r<=57},Lf=function(r){return r>=55296&&r<=57343},sr=function(r){return ce(r)||r>=nc&&r<=ac||r>=tc&&r<=Ff},Rf=function(r){return r>=tc&&r<=Qf},Hf=function(r){return r>=nc&&r<=If},Df=function(r){return Rf(r)||Hf(r)},Pf=function(r){return r>=vf},kn=function(r){return r===li||r===tf||r===rf},ci=function(r){return Df(r)||Pf(r)||r===of},Vo=function(r){return ci(r)||ce(r)||r===Be},Of=function(r){return r>=Ef&&r<=Uf||r===xf||r>=yf&&r<=Mf||r===Sf},ft=function(r,A){return r!==Kr?!1:A!==li},zn=function(r,A,e){return r===Be?ci(A)||ft(A,e):ci(r)?!0:!!(r===Kr&&ft(r,A))},va=function(r,A,e){return r===Rt||r===Be?ce(A)?!0:A===Jr&&ce(e):ce(r===Jr?A:r)},Nf=function(r){var A=0,e=1;(r[A]===Rt||r[A]===Be)&&(r[A]===Be&&(e=-1),A++);for(var t=[];ce(r[A]);)t.push(r[A++]);var n=t.length?parseInt(WA.apply(void 0,t),10):0;r[A]===Jr&&A++;for(var i=[];ce(r[A]);)i.push(r[A++]);var a=i.length,o=a?parseInt(WA.apply(void 0,i),10):0;(r[A]===ic||r[A]===rc)&&A++;var s=1;(r[A]===Rt||r[A]===Be)&&(r[A]===Be&&(s=-1),A++);for(var l=[];ce(r[A]);)l.push(r[A++]);var c=l.length?parseInt(WA.apply(void 0,l),10):0;return e*(n+o*Math.pow(10,-a))*Math.pow(10,s*c)},Gf={type:2},Vf={type:3},Kf={type:4},kf={type:13},zf={type:8},Wf={type:21},Xf={type:9},Yf={type:10},Jf={type:11},Zf={type:12},qf={type:14},Wn={type:23},jf={type:1},$f={type:25},Ap={type:24},ep={type:26},tp={type:27},rp={type:28},np={type:29},ip={type:31},Ja={type:32},sc=(function(){function r(){this._value=[]}return r.prototype.write=function(A){this._value=this._value.concat(yi(A))},r.prototype.read=function(){for(var A=[],e=this.consumeToken();e!==Ja;)A.push(e),e=this.consumeToken();return A},r.prototype.consumeToken=function(){var A=this.consumeCodePoint();switch(A){case Nn:return this.consumeStringToken(Nn);case nf:var e=this.peekCodePoint(0),t=this.peekCodePoint(1),n=this.peekCodePoint(2);if(Vo(e)||ft(t,n)){var i=zn(e,t,n)?ef:Af,a=this.consumeName();return{type:5,value:a,flags:i}}break;case af:if(this.peekCodePoint(0)===br)return this.consumeCodePoint(),kf;break;case Gn:return this.consumeStringToken(Gn);case Vn:return Gf;case Ir:return Vf;case Ba:if(this.peekCodePoint(0)===br)return this.consumeCodePoint(),qf;break;case Rt:if(va(A,this.peekCodePoint(0),this.peekCodePoint(1)))return this.reconsumeCodePoint(A),this.consumeNumericToken();break;case wf:return Kf;case Be:var o=A,s=this.peekCodePoint(0),l=this.peekCodePoint(1);if(va(o,s,l))return this.reconsumeCodePoint(A),this.consumeNumericToken();if(zn(o,s,l))return this.reconsumeCodePoint(A),this.consumeIdentLikeToken();if(s===Be&&l===uf)return this.consumeCodePoint(),this.consumeCodePoint(),Ap;break;case Jr:if(va(A,this.peekCodePoint(0),this.peekCodePoint(1)))return this.reconsumeCodePoint(A),this.consumeNumericToken();break;case Oo:if(this.peekCodePoint(0)===Ba)for(this.consumeCodePoint();;){var c=this.consumeCodePoint();if(c===Ba&&(c=this.consumeCodePoint(),c===Oo))return this.consumeToken();if(c===ze)return this.consumeToken()}break;case _f:return ep;case Cf:return tp;case cf:if(this.peekCodePoint(0)===lf&&this.peekCodePoint(1)===Be&&this.peekCodePoint(2)===Be)return this.consumeCodePoint(),this.consumeCodePoint(),$f;break;case hf:var u=this.peekCodePoint(0),h=this.peekCodePoint(1),d=this.peekCodePoint(2);if(zn(u,h,d)){var a=this.consumeName();return{type:7,value:a}}break;case df:return rp;case Kr:if(ft(A,this.peekCodePoint(0)))return this.reconsumeCodePoint(A),this.consumeIdentLikeToken();break;case ff:return np;case pf:if(this.peekCodePoint(0)===br)return this.consumeCodePoint(),zf;break;case gf:return Jf;case mf:return Zf;case Tf:case bf:var g=this.peekCodePoint(0),m=this.peekCodePoint(1);return g===Rt&&(sr(m)||m===Kn)&&(this.consumeCodePoint(),this.consumeUnicodeRangeToken()),this.reconsumeCodePoint(A),this.consumeIdentLikeToken();case No:if(this.peekCodePoint(0)===br)return this.consumeCodePoint(),Xf;if(this.peekCodePoint(0)===No)return this.consumeCodePoint(),Wf;break;case Bf:if(this.peekCodePoint(0)===br)return this.consumeCodePoint(),Yf;break;case ze:return Ja}return kn(A)?(this.consumeWhiteSpace(),ip):ce(A)?(this.reconsumeCodePoint(A),this.consumeNumericToken()):ci(A)?(this.reconsumeCodePoint(A),this.consumeIdentLikeToken()):{type:6,value:WA(A)}},r.prototype.consumeCodePoint=function(){var A=this._value.shift();return typeof A>"u"?-1:A},r.prototype.reconsumeCodePoint=function(A){this._value.unshift(A)},r.prototype.peekCodePoint=function(A){return A>=this._value.length?-1:this._value[A]},r.prototype.consumeUnicodeRangeToken=function(){for(var A=[],e=this.consumeCodePoint();sr(e)&&A.length<6;)A.push(e),e=this.consumeCodePoint();for(var t=!1;e===Kn&&A.length<6;)A.push(e),e=this.consumeCodePoint(),t=!0;if(t){var n=parseInt(WA.apply(void 0,A.map(function(s){return s===Kn?ec:s})),16),i=parseInt(WA.apply(void 0,A.map(function(s){return s===Kn?ac:s})),16);return{type:30,start:n,end:i}}var a=parseInt(WA.apply(void 0,A),16);if(this.peekCodePoint(0)===Be&&sr(this.peekCodePoint(1))){this.consumeCodePoint(),e=this.consumeCodePoint();for(var o=[];sr(e)&&o.length<6;)o.push(e),e=this.consumeCodePoint();var i=parseInt(WA.apply(void 0,o),16);return{type:30,start:a,end:i}}else return{type:30,start:a,end:a}},r.prototype.consumeIdentLikeToken=function(){var A=this.consumeName();return A.toLowerCase()==="url"&&this.peekCodePoint(0)===Vn?(this.consumeCodePoint(),this.consumeUrlToken()):this.peekCodePoint(0)===Vn?(this.consumeCodePoint(),{type:19,value:A}):{type:20,value:A}},r.prototype.consumeUrlToken=function(){var A=[];if(this.consumeWhiteSpace(),this.peekCodePoint(0)===ze)return{type:22,value:""};var e=this.peekCodePoint(0);if(e===Gn||e===Nn){var t=this.consumeStringToken(this.consumeCodePoint());return t.type===0&&(this.consumeWhiteSpace(),this.peekCodePoint(0)===ze||this.peekCodePoint(0)===Ir)?(this.consumeCodePoint(),{type:22,value:t.value}):(this.consumeBadUrlRemnants(),Wn)}for(;;){var n=this.consumeCodePoint();if(n===ze||n===Ir)return{type:22,value:WA.apply(void 0,A)};if(kn(n))return this.consumeWhiteSpace(),this.peekCodePoint(0)===ze||this.peekCodePoint(0)===Ir?(this.consumeCodePoint(),{type:22,value:WA.apply(void 0,A)}):(this.consumeBadUrlRemnants(),Wn);if(n===Nn||n===Gn||n===Vn||Of(n))return this.consumeBadUrlRemnants(),Wn;if(n===Kr)if(ft(n,this.peekCodePoint(0)))A.push(this.consumeEscapedCodePoint());else return this.consumeBadUrlRemnants(),Wn;else A.push(n)}},r.prototype.consumeWhiteSpace=function(){for(;kn(this.peekCodePoint(0));)this.consumeCodePoint()},r.prototype.consumeBadUrlRemnants=function(){for(;;){var A=this.consumeCodePoint();if(A===Ir||A===ze)return;ft(A,this.peekCodePoint(0))&&this.consumeEscapedCodePoint()}},r.prototype.consumeStringSlice=function(A){for(var e=5e4,t="";A>0;){var n=Math.min(e,A);t+=WA.apply(void 0,this._value.splice(0,n)),A-=n}return this._value.shift(),t},r.prototype.consumeStringToken=function(A){var e="",t=0;do{var n=this._value[t];if(n===ze||n===void 0||n===A)return e+=this.consumeStringSlice(t),{type:0,value:e};if(n===li)return this._value.splice(0,t),jf;if(n===Kr){var i=this._value[t+1];i!==ze&&i!==void 0&&(i===li?(e+=this.consumeStringSlice(t),t=-1,this._value.shift()):ft(n,i)&&(e+=this.consumeStringSlice(t),e+=WA(this.consumeEscapedCodePoint()),t=-1))}t++}while(!0)},r.prototype.consumeNumber=function(){var A=[],e=en,t=this.peekCodePoint(0);for((t===Rt||t===Be)&&A.push(this.consumeCodePoint());ce(this.peekCodePoint(0));)A.push(this.consumeCodePoint());t=this.peekCodePoint(0);var n=this.peekCodePoint(1);if(t===Jr&&ce(n))for(A.push(this.consumeCodePoint(),this.consumeCodePoint()),e=Po;ce(this.peekCodePoint(0));)A.push(this.consumeCodePoint());t=this.peekCodePoint(0),n=this.peekCodePoint(1);var i=this.peekCodePoint(2);if((t===ic||t===rc)&&((n===Rt||n===Be)&&ce(i)||ce(n)))for(A.push(this.consumeCodePoint(),this.consumeCodePoint()),e=Po;ce(this.peekCodePoint(0));)A.push(this.consumeCodePoint());return[Nf(A),e]},r.prototype.consumeNumericToken=function(){var A=this.consumeNumber(),e=A[0],t=A[1],n=this.peekCodePoint(0),i=this.peekCodePoint(1),a=this.peekCodePoint(2);if(zn(n,i,a)){var o=this.consumeName();return{type:15,number:e,flags:t,unit:o}}return n===sf?(this.consumeCodePoint(),{type:16,number:e,flags:t}):{type:17,number:e,flags:t}},r.prototype.consumeEscapedCodePoint=function(){var A=this.consumeCodePoint();if(sr(A)){for(var e=WA(A);sr(this.peekCodePoint(0))&&e.length<6;)e+=WA(this.consumeCodePoint());kn(this.peekCodePoint(0))&&this.consumeCodePoint();var t=parseInt(e,16);return t===0||Lf(t)||t>1114111?Go:t}return A===ze?Go:A},r.prototype.consumeName=function(){for(var A="";;){var e=this.consumeCodePoint();if(Vo(e))A+=WA(e);else if(ft(e,this.peekCodePoint(0)))A+=WA(this.consumeEscapedCodePoint());else return this.reconsumeCodePoint(e),A}},r})(),oc=(function(){function r(A){this._tokens=A}return r.create=function(A){var e=new sc;return e.write(A),new r(e.read())},r.parseValue=function(A){return r.create(A).parseComponentValue()},r.parseValues=function(A){return r.create(A).parseComponentValues()},r.prototype.parseComponentValue=function(){for(var A=this.consumeToken();A.type===31;)A=this.consumeToken();if(A.type===32)throw new SyntaxError("Error parsing CSS component value, unexpected EOF");this.reconsumeToken(A);var e=this.consumeComponentValue();do A=this.consumeToken();while(A.type===31);if(A.type===32)return e;throw new SyntaxError("Error parsing CSS component value, multiple values found when expecting only one")},r.prototype.parseComponentValues=function(){for(var A=[];;){var e=this.consumeComponentValue();if(e.type===32)return A;A.push(e),A.push()}},r.prototype.consumeComponentValue=function(){var A=this.consumeToken();switch(A.type){case 11:case 28:case 2:return this.consumeSimpleBlock(A.type);case 19:return this.consumeFunction(A)}return A},r.prototype.consumeSimpleBlock=function(A){for(var e={type:A,values:[]},t=this.consumeToken();;){if(t.type===32||sp(t,A))return e;this.reconsumeToken(t),e.values.push(this.consumeComponentValue()),t=this.consumeToken()}},r.prototype.consumeFunction=function(A){for(var e={name:A.value,values:[],type:18};;){var t=this.consumeToken();if(t.type===32||t.type===3)return e;this.reconsumeToken(t),e.values.push(this.consumeComponentValue())}},r.prototype.consumeToken=function(){var A=this._tokens.shift();return typeof A>"u"?Ja:A},r.prototype.reconsumeToken=function(A){this._tokens.unshift(A)},r})(),tn=function(r){return r.type===15},wr=function(r){return r.type===17},OA=function(r){return r.type===20},ap=function(r){return r.type===0},Za=function(r,A){return OA(r)&&r.value===A},lc=function(r){return r.type!==31},mr=function(r){return r.type!==31&&r.type!==4},Ye=function(r){var A=[],e=[];return r.forEach(function(t){if(t.type===4){if(e.length===0)throw new Error("Error parsing function args, zero tokens for arg");A.push(e),e=[];return}t.type!==31&&e.push(t)}),e.length&&A.push(e),A},sp=function(r,A){return A===11&&r.type===12||A===28&&r.type===29?!0:A===2&&r.type===3},wt=function(r){return r.type===17||r.type===15},JA=function(r){return r.type===16||wt(r)},cc=function(r){return r.length>1?[r[0],r[1]]:[r[0]]},ne={type:17,number:0,flags:en},us={type:16,number:50,flags:en},gt={type:16,number:100,flags:en},Or=function(r,A,e){var t=r[0],n=r[1];return[NA(t,A),NA(typeof n<"u"?n:t,e)]},NA=function(r,A){if(r.type===16)return r.number/100*A;if(tn(r))switch(r.unit){case"rem":case"em":return 16*r.number;default:return r.number}return r.number},uc="deg",hc="grad",dc="rad",fc="turn",Mi={name:"angle",parse:function(r,A){if(A.type===15)switch(A.unit){case uc:return Math.PI*A.number/180;case hc:return Math.PI/200*A.number;case dc:return A.number;case fc:return Math.PI*2*A.number}throw new Error("Unsupported angle type")}},pc=function(r){return r.type===15&&(r.unit===uc||r.unit===hc||r.unit===dc||r.unit===fc)},gc=function(r){var A=r.filter(OA).map(function(e){return e.value}).join(" ");switch(A){case"to bottom right":case"to right bottom":case"left top":case"top left":return[ne,ne];case"to top":case"bottom":return Ie(0);case"to bottom left":case"to left bottom":case"right top":case"top right":return[ne,gt];case"to right":case"left":return Ie(90);case"to top left":case"to left top":case"right bottom":case"bottom right":return[gt,gt];case"to bottom":case"top":return Ie(180);case"to top right":case"to right top":case"left bottom":case"bottom left":return[gt,ne];case"to left":case"right":return Ie(270)}return 0},Ie=function(r){return Math.PI*r/180},Bt={name:"color",parse:function(r,A){if(A.type===18){var e=op[A.name];if(typeof e>"u")throw new Error('Attempting to parse an unsupported color function "'+A.name+'"');return e(r,A.values)}if(A.type===5){if(A.value.length===3){var t=A.value.substring(0,1),n=A.value.substring(1,2),i=A.value.substring(2,3);return mt(parseInt(t+t,16),parseInt(n+n,16),parseInt(i+i,16),1)}if(A.value.length===4){var t=A.value.substring(0,1),n=A.value.substring(1,2),i=A.value.substring(2,3),a=A.value.substring(3,4);return mt(parseInt(t+t,16),parseInt(n+n,16),parseInt(i+i,16),parseInt(a+a,16)/255)}if(A.value.length===6){var t=A.value.substring(0,2),n=A.value.substring(2,4),i=A.value.substring(4,6);return mt(parseInt(t,16),parseInt(n,16),parseInt(i,16),1)}if(A.value.length===8){var t=A.value.substring(0,2),n=A.value.substring(2,4),i=A.value.substring(4,6),a=A.value.substring(6,8);return mt(parseInt(t,16),parseInt(n,16),parseInt(i,16),parseInt(a,16)/255)}}if(A.type===20){var o=nt[A.value.toUpperCase()];if(typeof o<"u")return o}return nt.TRANSPARENT}},vt=function(r){return(255&r)===0},te=function(r){var A=255&r,e=255&r>>8,t=255&r>>16,n=255&r>>24;return A<255?"rgba("+n+","+t+","+e+","+A/255+")":"rgb("+n+","+t+","+e+")"},mt=function(r,A,e,t){return(r<<24|A<<16|e<<8|Math.round(t*255)<<0)>>>0},Ko=function(r,A){if(r.type===17)return r.number;if(r.type===16){var e=A===3?1:255;return A===3?r.number/100*e:Math.round(r.number/100*e)}return 0},ko=function(r,A){var e=A.filter(mr);if(e.length===3){var t=e.map(Ko),n=t[0],i=t[1],a=t[2];return mt(n,i,a,1)}if(e.length===4){var o=e.map(Ko),n=o[0],i=o[1],a=o[2],s=o[3];return mt(n,i,a,s)}return 0};function wa(r,A,e){return e<0&&(e+=1),e>=1&&(e-=1),e<1/6?(A-r)*e*6+r:e<1/2?A:e<2/3?(A-r)*6*(2/3-e)+r:r}var zo=function(r,A){var e=A.filter(mr),t=e[0],n=e[1],i=e[2],a=e[3],o=(t.type===17?Ie(t.number):Mi.parse(r,t))/(Math.PI*2),s=JA(n)?n.number/100:0,l=JA(i)?i.number/100:0,c=typeof a<"u"&&JA(a)?NA(a,1):1;if(s===0)return mt(l*255,l*255,l*255,1);var u=l<=.5?l*(s+1):l+s-l*s,h=l*2-u,d=wa(h,u,o+1/3),g=wa(h,u,o),m=wa(h,u,o-1/3);return mt(d*255,g*255,m*255,c)},op={hsl:zo,hsla:zo,rgb:ko,rgba:ko},kr=function(r,A){return Bt.parse(r,oc.create(A).parseComponentValue())},nt={ALICEBLUE:4042850303,ANTIQUEWHITE:4209760255,AQUA:16777215,AQUAMARINE:2147472639,AZURE:4043309055,BEIGE:4126530815,BISQUE:4293182719,BLACK:255,BLANCHEDALMOND:4293643775,BLUE:65535,BLUEVIOLET:2318131967,BROWN:2771004159,BURLYWOOD:3736635391,CADETBLUE:1604231423,CHARTREUSE:2147418367,CHOCOLATE:3530104575,CORAL:4286533887,CORNFLOWERBLUE:1687547391,CORNSILK:4294499583,CRIMSON:3692313855,CYAN:16777215,DARKBLUE:35839,DARKCYAN:9145343,DARKGOLDENROD:3095837695,DARKGRAY:2846468607,DARKGREEN:6553855,DARKGREY:2846468607,DARKKHAKI:3182914559,DARKMAGENTA:2332068863,DARKOLIVEGREEN:1433087999,DARKORANGE:4287365375,DARKORCHID:2570243327,DARKRED:2332033279,DARKSALMON:3918953215,DARKSEAGREEN:2411499519,DARKSLATEBLUE:1211993087,DARKSLATEGRAY:793726975,DARKSLATEGREY:793726975,DARKTURQUOISE:13554175,DARKVIOLET:2483082239,DEEPPINK:4279538687,DEEPSKYBLUE:12582911,DIMGRAY:1768516095,DIMGREY:1768516095,DODGERBLUE:512819199,FIREBRICK:2988581631,FLORALWHITE:4294635775,FORESTGREEN:579543807,FUCHSIA:4278255615,GAINSBORO:3705462015,GHOSTWHITE:4177068031,GOLD:4292280575,GOLDENROD:3668254975,GRAY:2155905279,GREEN:8388863,GREENYELLOW:2919182335,GREY:2155905279,HONEYDEW:4043305215,HOTPINK:4285117695,INDIANRED:3445382399,INDIGO:1258324735,IVORY:4294963455,KHAKI:4041641215,LAVENDER:3873897215,LAVENDERBLUSH:4293981695,LAWNGREEN:2096890111,LEMONCHIFFON:4294626815,LIGHTBLUE:2916673279,LIGHTCORAL:4034953471,LIGHTCYAN:3774873599,LIGHTGOLDENRODYELLOW:4210742015,LIGHTGRAY:3553874943,LIGHTGREEN:2431553791,LIGHTGREY:3553874943,LIGHTPINK:4290167295,LIGHTSALMON:4288707327,LIGHTSEAGREEN:548580095,LIGHTSKYBLUE:2278488831,LIGHTSLATEGRAY:2005441023,LIGHTSLATEGREY:2005441023,LIGHTSTEELBLUE:2965692159,LIGHTYELLOW:4294959359,LIME:16711935,LIMEGREEN:852308735,LINEN:4210091775,MAGENTA:4278255615,MAROON:2147483903,MEDIUMAQUAMARINE:1724754687,MEDIUMBLUE:52735,MEDIUMORCHID:3126187007,MEDIUMPURPLE:2473647103,MEDIUMSEAGREEN:1018393087,MEDIUMSLATEBLUE:2070474495,MEDIUMSPRINGGREEN:16423679,MEDIUMTURQUOISE:1221709055,MEDIUMVIOLETRED:3340076543,MIDNIGHTBLUE:421097727,MINTCREAM:4127193855,MISTYROSE:4293190143,MOCCASIN:4293178879,NAVAJOWHITE:4292783615,NAVY:33023,OLDLACE:4260751103,OLIVE:2155872511,OLIVEDRAB:1804477439,ORANGE:4289003775,ORANGERED:4282712319,ORCHID:3664828159,PALEGOLDENROD:4008225535,PALEGREEN:2566625535,PALETURQUOISE:2951671551,PALEVIOLETRED:3681588223,PAPAYAWHIP:4293907967,PEACHPUFF:4292524543,PERU:3448061951,PINK:4290825215,PLUM:3718307327,POWDERBLUE:2967529215,PURPLE:2147516671,REBECCAPURPLE:1714657791,RED:4278190335,ROSYBROWN:3163525119,ROYALBLUE:1097458175,SADDLEBROWN:2336560127,SALMON:4202722047,SANDYBROWN:4104413439,SEAGREEN:780883967,SEASHELL:4294307583,SIENNA:2689740287,SILVER:3233857791,SKYBLUE:2278484991,SLATEBLUE:1784335871,SLATEGRAY:1887473919,SLATEGREY:1887473919,SNOW:4294638335,SPRINGGREEN:16744447,STEELBLUE:1182971135,TAN:3535047935,TEAL:8421631,THISTLE:3636451583,TOMATO:4284696575,TRANSPARENT:0,TURQUOISE:1088475391,VIOLET:4001558271,WHEAT:4125012991,WHITE:4294967295,WHITESMOKE:4126537215,YELLOW:4294902015,YELLOWGREEN:2597139199},lp={name:"background-clip",initialValue:"border-box",prefix:!1,type:1,parse:function(r,A){return A.map(function(e){if(OA(e))switch(e.value){case"padding-box":return 1;case"content-box":return 2}return 0})}},cp={name:"background-color",initialValue:"transparent",prefix:!1,type:3,format:"color"},Si=function(r,A){var e=Bt.parse(r,A[0]),t=A[1];return t&&JA(t)?{color:e,stop:t}:{color:e,stop:null}},Wo=function(r,A){var e=r[0],t=r[r.length-1];e.stop===null&&(e.stop=ne),t.stop===null&&(t.stop=gt);for(var n=[],i=0,a=0;a<r.length;a++){var o=r[a].stop;if(o!==null){var s=NA(o,A);s>i?n.push(s):n.push(i),i=s}else n.push(null)}for(var l=null,a=0;a<n.length;a++){var c=n[a];if(c===null)l===null&&(l=a);else if(l!==null){for(var u=a-l,h=n[l-1],d=(c-h)/(u+1),g=1;g<=u;g++)n[l+g-1]=d*g;l=null}}return r.map(function(m,f){var v=m.color;return{color:v,stop:Math.max(Math.min(1,n[f]/A),0)}})},up=function(r,A,e){var t=A/2,n=e/2,i=NA(r[0],A)-t,a=n-NA(r[1],e);return(Math.atan2(a,i)+Math.PI*2)%(Math.PI*2)},hp=function(r,A,e){var t=typeof r=="number"?r:up(r,A,e),n=Math.abs(A*Math.sin(t))+Math.abs(e*Math.cos(t)),i=A/2,a=e/2,o=n/2,s=Math.sin(t-Math.PI/2)*o,l=Math.cos(t-Math.PI/2)*o;return[n,i-l,i+l,a-s,a+s]},Ge=function(r,A){return Math.sqrt(r*r+A*A)},Xo=function(r,A,e,t,n){var i=[[0,0],[0,A],[r,0],[r,A]];return i.reduce(function(a,o){var s=o[0],l=o[1],c=Ge(e-s,t-l);return(n?c<a.optimumDistance:c>a.optimumDistance)?{optimumCorner:o,optimumDistance:c}:a},{optimumDistance:n?1/0:-1/0,optimumCorner:null}).optimumCorner},dp=function(r,A,e,t,n){var i=0,a=0;switch(r.size){case 0:r.shape===0?i=a=Math.min(Math.abs(A),Math.abs(A-t),Math.abs(e),Math.abs(e-n)):r.shape===1&&(i=Math.min(Math.abs(A),Math.abs(A-t)),a=Math.min(Math.abs(e),Math.abs(e-n)));break;case 2:if(r.shape===0)i=a=Math.min(Ge(A,e),Ge(A,e-n),Ge(A-t,e),Ge(A-t,e-n));else if(r.shape===1){var o=Math.min(Math.abs(e),Math.abs(e-n))/Math.min(Math.abs(A),Math.abs(A-t)),s=Xo(t,n,A,e,!0),l=s[0],c=s[1];i=Ge(l-A,(c-e)/o),a=o*i}break;case 1:r.shape===0?i=a=Math.max(Math.abs(A),Math.abs(A-t),Math.abs(e),Math.abs(e-n)):r.shape===1&&(i=Math.max(Math.abs(A),Math.abs(A-t)),a=Math.max(Math.abs(e),Math.abs(e-n)));break;case 3:if(r.shape===0)i=a=Math.max(Ge(A,e),Ge(A,e-n),Ge(A-t,e),Ge(A-t,e-n));else if(r.shape===1){var o=Math.max(Math.abs(e),Math.abs(e-n))/Math.max(Math.abs(A),Math.abs(A-t)),u=Xo(t,n,A,e,!1),l=u[0],c=u[1];i=Ge(l-A,(c-e)/o),a=o*i}break}return Array.isArray(r.size)&&(i=NA(r.size[0],t),a=r.size.length===2?NA(r.size[1],n):i),[i,a]},fp=function(r,A){var e=Ie(180),t=[];return Ye(A).forEach(function(n,i){if(i===0){var a=n[0];if(a.type===20&&a.value==="to"){e=gc(n);return}else if(pc(a)){e=Mi.parse(r,a);return}}var o=Si(r,n);t.push(o)}),{angle:e,stops:t,type:1}},Xn=function(r,A){var e=Ie(180),t=[];return Ye(A).forEach(function(n,i){if(i===0){var a=n[0];if(a.type===20&&["top","left","right","bottom"].indexOf(a.value)!==-1){e=gc(n);return}else if(pc(a)){e=(Mi.parse(r,a)+Ie(270))%Ie(360);return}}var o=Si(r,n);t.push(o)}),{angle:e,stops:t,type:1}},pp=function(r,A){var e=Ie(180),t=[],n=1,i=0,a=3,o=[];return Ye(A).forEach(function(s,l){var c=s[0];if(l===0){if(OA(c)&&c.value==="linear"){n=1;return}else if(OA(c)&&c.value==="radial"){n=2;return}}if(c.type===18){if(c.name==="from"){var u=Bt.parse(r,c.values[0]);t.push({stop:ne,color:u})}else if(c.name==="to"){var u=Bt.parse(r,c.values[0]);t.push({stop:gt,color:u})}else if(c.name==="color-stop"){var h=c.values.filter(mr);if(h.length===2){var u=Bt.parse(r,h[1]),d=h[0];wr(d)&&t.push({stop:{type:16,number:d.number*100,flags:d.flags},color:u})}}}}),n===1?{angle:(e+Ie(180))%Ie(360),stops:t,type:n}:{size:a,shape:i,stops:t,position:o,type:n}},mc="closest-side",Bc="farthest-side",vc="closest-corner",wc="farthest-corner",_c="circle",Cc="ellipse",Ec="cover",Uc="contain",gp=function(r,A){var e=0,t=3,n=[],i=[];return Ye(A).forEach(function(a,o){var s=!0;if(o===0){var l=!1;s=a.reduce(function(u,h){if(l)if(OA(h))switch(h.value){case"center":return i.push(us),u;case"top":case"left":return i.push(ne),u;case"right":case"bottom":return i.push(gt),u}else(JA(h)||wt(h))&&i.push(h);else if(OA(h))switch(h.value){case _c:return e=0,!1;case Cc:return e=1,!1;case"at":return l=!0,!1;case mc:return t=0,!1;case Ec:case Bc:return t=1,!1;case Uc:case vc:return t=2,!1;case wc:return t=3,!1}else if(wt(h)||JA(h))return Array.isArray(t)||(t=[]),t.push(h),!1;return u},s)}if(s){var c=Si(r,a);n.push(c)}}),{size:t,shape:e,stops:n,position:i,type:2}},Yn=function(r,A){var e=0,t=3,n=[],i=[];return Ye(A).forEach(function(a,o){var s=!0;if(o===0?s=a.reduce(function(c,u){if(OA(u))switch(u.value){case"center":return i.push(us),!1;case"top":case"left":return i.push(ne),!1;case"right":case"bottom":return i.push(gt),!1}else if(JA(u)||wt(u))return i.push(u),!1;return c},s):o===1&&(s=a.reduce(function(c,u){if(OA(u))switch(u.value){case _c:return e=0,!1;case Cc:return e=1,!1;case Uc:case mc:return t=0,!1;case Bc:return t=1,!1;case vc:return t=2,!1;case Ec:case wc:return t=3,!1}else if(wt(u)||JA(u))return Array.isArray(t)||(t=[]),t.push(u),!1;return c},s)),s){var l=Si(r,a);n.push(l)}}),{size:t,shape:e,stops:n,position:i,type:2}},mp=function(r){return r.type===1},Bp=function(r){return r.type===2},hs={name:"image",parse:function(r,A){if(A.type===22){var e={url:A.value,type:0};return r.cache.addImage(A.value),e}if(A.type===18){var t=xc[A.name];if(typeof t>"u")throw new Error('Attempting to parse an unsupported image function "'+A.name+'"');return t(r,A.values)}throw new Error("Unsupported image type "+A.type)}};function vp(r){return!(r.type===20&&r.value==="none")&&(r.type!==18||!!xc[r.name])}var xc={"linear-gradient":fp,"-moz-linear-gradient":Xn,"-ms-linear-gradient":Xn,"-o-linear-gradient":Xn,"-webkit-linear-gradient":Xn,"radial-gradient":gp,"-moz-radial-gradient":Yn,"-ms-radial-gradient":Yn,"-o-radial-gradient":Yn,"-webkit-radial-gradient":Yn,"-webkit-gradient":pp},wp={name:"background-image",initialValue:"none",type:1,prefix:!1,parse:function(r,A){if(A.length===0)return[];var e=A[0];return e.type===20&&e.value==="none"?[]:A.filter(function(t){return mr(t)&&vp(t)}).map(function(t){return hs.parse(r,t)})}},_p={name:"background-origin",initialValue:"border-box",prefix:!1,type:1,parse:function(r,A){return A.map(function(e){if(OA(e))switch(e.value){case"padding-box":return 1;case"content-box":return 2}return 0})}},Cp={name:"background-position",initialValue:"0% 0%",type:1,prefix:!1,parse:function(r,A){return Ye(A).map(function(e){return e.filter(JA)}).map(cc)}},Ep={name:"background-repeat",initialValue:"repeat",prefix:!1,type:1,parse:function(r,A){return Ye(A).map(function(e){return e.filter(OA).map(function(t){return t.value}).join(" ")}).map(Up)}},Up=function(r){switch(r){case"no-repeat":return 1;case"repeat-x":case"repeat no-repeat":return 2;case"repeat-y":case"no-repeat repeat":return 3;default:return 0}},pr;(function(r){r.AUTO="auto",r.CONTAIN="contain",r.COVER="cover"})(pr||(pr={}));var xp={name:"background-size",initialValue:"0",prefix:!1,type:1,parse:function(r,A){return Ye(A).map(function(e){return e.filter(yp)})}},yp=function(r){return OA(r)||JA(r)},Fi=function(r){return{name:"border-"+r+"-color",initialValue:"transparent",prefix:!1,type:3,format:"color"}},Mp=Fi("top"),Sp=Fi("right"),Fp=Fi("bottom"),Tp=Fi("left"),Ti=function(r){return{name:"border-radius-"+r,initialValue:"0 0",prefix:!1,type:1,parse:function(A,e){return cc(e.filter(JA))}}},Qp=Ti("top-left"),bp=Ti("top-right"),Ip=Ti("bottom-right"),Lp=Ti("bottom-left"),Qi=function(r){return{name:"border-"+r+"-style",initialValue:"solid",prefix:!1,type:2,parse:function(A,e){switch(e){case"none":return 0;case"dashed":return 2;case"dotted":return 3;case"double":return 4}return 1}}},Rp=Qi("top"),Hp=Qi("right"),Dp=Qi("bottom"),Pp=Qi("left"),bi=function(r){return{name:"border-"+r+"-width",initialValue:"0",type:0,prefix:!1,parse:function(A,e){return tn(e)?e.number:0}}},Op=bi("top"),Np=bi("right"),Gp=bi("bottom"),Vp=bi("left"),Kp={name:"color",initialValue:"transparent",prefix:!1,type:3,format:"color"},kp={name:"direction",initialValue:"ltr",prefix:!1,type:2,parse:function(r,A){return A==="rtl"?1:0}},zp={name:"display",initialValue:"inline-block",prefix:!1,type:1,parse:function(r,A){return A.filter(OA).reduce(function(e,t){return e|Wp(t.value)},0)}},Wp=function(r){switch(r){case"block":case"-webkit-box":return 2;case"inline":return 4;case"run-in":return 8;case"flow":return 16;case"flow-root":return 32;case"table":return 64;case"flex":case"-webkit-flex":return 128;case"grid":case"-ms-grid":return 256;case"ruby":return 512;case"subgrid":return 1024;case"list-item":return 2048;case"table-row-group":return 4096;case"table-header-group":return 8192;case"table-footer-group":return 16384;case"table-row":return 32768;case"table-cell":return 65536;case"table-column-group":return 131072;case"table-column":return 262144;case"table-caption":return 524288;case"ruby-base":return 1048576;case"ruby-text":return 2097152;case"ruby-base-container":return 4194304;case"ruby-text-container":return 8388608;case"contents":return 16777216;case"inline-block":return 33554432;case"inline-list-item":return 67108864;case"inline-table":return 134217728;case"inline-flex":return 268435456;case"inline-grid":return 536870912}return 0},Xp={name:"float",initialValue:"none",prefix:!1,type:2,parse:function(r,A){switch(A){case"left":return 1;case"right":return 2;case"inline-start":return 3;case"inline-end":return 4}return 0}},Yp={name:"letter-spacing",initialValue:"0",prefix:!1,type:0,parse:function(r,A){return A.type===20&&A.value==="normal"?0:A.type===17||A.type===15?A.number:0}},ui;(function(r){r.NORMAL="normal",r.STRICT="strict"})(ui||(ui={}));var Jp={name:"line-break",initialValue:"normal",prefix:!1,type:2,parse:function(r,A){return A==="strict"?ui.STRICT:ui.NORMAL}},Zp={name:"line-height",initialValue:"normal",prefix:!1,type:4},Yo=function(r,A){return OA(r)&&r.value==="normal"?1.2*A:r.type===17?A*r.number:JA(r)?NA(r,A):A},qp={name:"list-style-image",initialValue:"none",type:0,prefix:!1,parse:function(r,A){return A.type===20&&A.value==="none"?null:hs.parse(r,A)}},jp={name:"list-style-position",initialValue:"outside",prefix:!1,type:2,parse:function(r,A){return A==="inside"?0:1}},qa={name:"list-style-type",initialValue:"none",prefix:!1,type:2,parse:function(r,A){switch(A){case"disc":return 0;case"circle":return 1;case"square":return 2;case"decimal":return 3;case"cjk-decimal":return 4;case"decimal-leading-zero":return 5;case"lower-roman":return 6;case"upper-roman":return 7;case"lower-greek":return 8;case"lower-alpha":return 9;case"upper-alpha":return 10;case"arabic-indic":return 11;case"armenian":return 12;case"bengali":return 13;case"cambodian":return 14;case"cjk-earthly-branch":return 15;case"cjk-heavenly-stem":return 16;case"cjk-ideographic":return 17;case"devanagari":return 18;case"ethiopic-numeric":return 19;case"georgian":return 20;case"gujarati":return 21;case"gurmukhi":return 22;case"hebrew":return 22;case"hiragana":return 23;case"hiragana-iroha":return 24;case"japanese-formal":return 25;case"japanese-informal":return 26;case"kannada":return 27;case"katakana":return 28;case"katakana-iroha":return 29;case"khmer":return 30;case"korean-hangul-formal":return 31;case"korean-hanja-formal":return 32;case"korean-hanja-informal":return 33;case"lao":return 34;case"lower-armenian":return 35;case"malayalam":return 36;case"mongolian":return 37;case"myanmar":return 38;case"oriya":return 39;case"persian":return 40;case"simp-chinese-formal":return 41;case"simp-chinese-informal":return 42;case"tamil":return 43;case"telugu":return 44;case"thai":return 45;case"tibetan":return 46;case"trad-chinese-formal":return 47;case"trad-chinese-informal":return 48;case"upper-armenian":return 49;case"disclosure-open":return 50;case"disclosure-closed":return 51;default:return-1}}},Ii=function(r){return{name:"margin-"+r,initialValue:"0",prefix:!1,type:4}},$p=Ii("top"),Ag=Ii("right"),eg=Ii("bottom"),tg=Ii("left"),rg={name:"overflow",initialValue:"visible",prefix:!1,type:1,parse:function(r,A){return A.filter(OA).map(function(e){switch(e.value){case"hidden":return 1;case"scroll":return 2;case"clip":return 3;case"auto":return 4;default:return 0}})}},ng={name:"overflow-wrap",initialValue:"normal",prefix:!1,type:2,parse:function(r,A){return A==="break-word"?"break-word":"normal"}},Li=function(r){return{name:"padding-"+r,initialValue:"0",prefix:!1,type:3,format:"length-percentage"}},ig=Li("top"),ag=Li("right"),sg=Li("bottom"),og=Li("left"),lg={name:"text-align",initialValue:"left",prefix:!1,type:2,parse:function(r,A){switch(A){case"right":return 2;case"center":case"justify":return 1;default:return 0}}},cg={name:"position",initialValue:"static",prefix:!1,type:2,parse:function(r,A){switch(A){case"relative":return 1;case"absolute":return 2;case"fixed":return 3;case"sticky":return 4}return 0}},ug={name:"text-shadow",initialValue:"none",type:1,prefix:!1,parse:function(r,A){return A.length===1&&Za(A[0],"none")?[]:Ye(A).map(function(e){for(var t={color:nt.TRANSPARENT,offsetX:ne,offsetY:ne,blur:ne},n=0,i=0;i<e.length;i++){var a=e[i];wt(a)?(n===0?t.offsetX=a:n===1?t.offsetY=a:t.blur=a,n++):t.color=Bt.parse(r,a)}return t})}},hg={name:"text-transform",initialValue:"none",prefix:!1,type:2,parse:function(r,A){switch(A){case"uppercase":return 2;case"lowercase":return 1;case"capitalize":return 3}return 0}},dg={name:"transform",initialValue:"none",prefix:!0,type:0,parse:function(r,A){if(A.type===20&&A.value==="none")return null;if(A.type===18){var e=gg[A.name];if(typeof e>"u")throw new Error('Attempting to parse an unsupported transform function "'+A.name+'"');return e(A.values)}return null}},fg=function(r){var A=r.filter(function(e){return e.type===17}).map(function(e){return e.number});return A.length===6?A:null},pg=function(r){var A=r.filter(function(s){return s.type===17}).map(function(s){return s.number}),e=A[0],t=A[1];A[2],A[3];var n=A[4],i=A[5];A[6],A[7],A[8],A[9],A[10],A[11];var a=A[12],o=A[13];return A[14],A[15],A.length===16?[e,t,n,i,a,o]:null},gg={matrix:fg,matrix3d:pg},Jo={type:16,number:50,flags:en},mg=[Jo,Jo],Bg={name:"transform-origin",initialValue:"50% 50%",prefix:!0,type:1,parse:function(r,A){var e=A.filter(JA);return e.length!==2?mg:[e[0],e[1]]}},vg={name:"visible",initialValue:"none",prefix:!1,type:2,parse:function(r,A){switch(A){case"hidden":return 1;case"collapse":return 2;default:return 0}}},zr;(function(r){r.NORMAL="normal",r.BREAK_ALL="break-all",r.KEEP_ALL="keep-all"})(zr||(zr={}));var wg={name:"word-break",initialValue:"normal",prefix:!1,type:2,parse:function(r,A){switch(A){case"break-all":return zr.BREAK_ALL;case"keep-all":return zr.KEEP_ALL;default:return zr.NORMAL}}},_g={name:"z-index",initialValue:"auto",prefix:!1,type:0,parse:function(r,A){if(A.type===20)return{auto:!0,order:0};if(wr(A))return{auto:!1,order:A.number};throw new Error("Invalid z-index number parsed")}},yc={name:"time",parse:function(r,A){if(A.type===15)switch(A.unit.toLowerCase()){case"s":return 1e3*A.number;case"ms":return A.number}throw new Error("Unsupported time type")}},Cg={name:"opacity",initialValue:"1",type:0,prefix:!1,parse:function(r,A){return wr(A)?A.number:1}},Eg={name:"text-decoration-color",initialValue:"transparent",prefix:!1,type:3,format:"color"},Ug={name:"text-decoration-line",initialValue:"none",prefix:!1,type:1,parse:function(r,A){return A.filter(OA).map(function(e){switch(e.value){case"underline":return 1;case"overline":return 2;case"line-through":return 3;case"none":return 4}return 0}).filter(function(e){return e!==0})}},xg={name:"font-family",initialValue:"",prefix:!1,type:1,parse:function(r,A){var e=[],t=[];return A.forEach(function(n){switch(n.type){case 20:case 0:e.push(n.value);break;case 17:e.push(n.number.toString());break;case 4:t.push(e.join(" ")),e.length=0;break}}),e.length&&t.push(e.join(" ")),t.map(function(n){return n.indexOf(" ")===-1?n:"'"+n+"'"})}},yg={name:"font-size",initialValue:"0",prefix:!1,type:3,format:"length"},Mg={name:"font-weight",initialValue:"normal",type:0,prefix:!1,parse:function(r,A){return wr(A)?A.number:OA(A)&&A.value==="bold"?700:400}},Sg={name:"font-variant",initialValue:"none",type:1,prefix:!1,parse:function(r,A){return A.filter(OA).map(function(e){return e.value})}},Fg={name:"font-style",initialValue:"normal",prefix:!1,type:2,parse:function(r,A){switch(A){case"oblique":return"oblique";case"italic":return"italic";default:return"normal"}}},jA=function(r,A){return(r&A)!==0},Tg={name:"content",initialValue:"none",type:1,prefix:!1,parse:function(r,A){if(A.length===0)return[];var e=A[0];return e.type===20&&e.value==="none"?[]:A}},Qg={name:"counter-increment",initialValue:"none",prefix:!0,type:1,parse:function(r,A){if(A.length===0)return null;var e=A[0];if(e.type===20&&e.value==="none")return null;for(var t=[],n=A.filter(lc),i=0;i<n.length;i++){var a=n[i],o=n[i+1];if(a.type===20){var s=o&&wr(o)?o.number:1;t.push({counter:a.value,increment:s})}}return t}},bg={name:"counter-reset",initialValue:"none",prefix:!0,type:1,parse:function(r,A){if(A.length===0)return[];for(var e=[],t=A.filter(lc),n=0;n<t.length;n++){var i=t[n],a=t[n+1];if(OA(i)&&i.value!=="none"){var o=a&&wr(a)?a.number:0;e.push({counter:i.value,reset:o})}}return e}},Ig={name:"duration",initialValue:"0s",prefix:!1,type:1,parse:function(r,A){return A.filter(tn).map(function(e){return yc.parse(r,e)})}},Lg={name:"quotes",initialValue:"none",prefix:!0,type:1,parse:function(r,A){if(A.length===0)return null;var e=A[0];if(e.type===20&&e.value==="none")return null;var t=[],n=A.filter(ap);if(n.length%2!==0)return null;for(var i=0;i<n.length;i+=2){var a=n[i].value,o=n[i+1].value;t.push({open:a,close:o})}return t}},Zo=function(r,A,e){if(!r)return"";var t=r[Math.min(A,r.length-1)];return t?e?t.open:t.close:""},Rg={name:"box-shadow",initialValue:"none",type:1,prefix:!1,parse:function(r,A){return A.length===1&&Za(A[0],"none")?[]:Ye(A).map(function(e){for(var t={color:255,offsetX:ne,offsetY:ne,blur:ne,spread:ne,inset:!1},n=0,i=0;i<e.length;i++){var a=e[i];Za(a,"inset")?t.inset=!0:wt(a)?(n===0?t.offsetX=a:n===1?t.offsetY=a:n===2?t.blur=a:t.spread=a,n++):t.color=Bt.parse(r,a)}return t})}},Hg={name:"paint-order",initialValue:"normal",prefix:!1,type:1,parse:function(r,A){var e=[0,1,2],t=[];return A.filter(OA).forEach(function(n){switch(n.value){case"stroke":t.push(1);break;case"fill":t.push(0);break;case"markers":t.push(2);break}}),e.forEach(function(n){t.indexOf(n)===-1&&t.push(n)}),t}},Dg={name:"-webkit-text-stroke-color",initialValue:"currentcolor",prefix:!1,type:3,format:"color"},Pg={name:"-webkit-text-stroke-width",initialValue:"0",type:0,prefix:!1,parse:function(r,A){return tn(A)?A.number:0}},Og=(function(){function r(A,e){var t,n;this.animationDuration=lA(A,Ig,e.animationDuration),this.backgroundClip=lA(A,lp,e.backgroundClip),this.backgroundColor=lA(A,cp,e.backgroundColor),this.backgroundImage=lA(A,wp,e.backgroundImage),this.backgroundOrigin=lA(A,_p,e.backgroundOrigin),this.backgroundPosition=lA(A,Cp,e.backgroundPosition),this.backgroundRepeat=lA(A,Ep,e.backgroundRepeat),this.backgroundSize=lA(A,xp,e.backgroundSize),this.borderTopColor=lA(A,Mp,e.borderTopColor),this.borderRightColor=lA(A,Sp,e.borderRightColor),this.borderBottomColor=lA(A,Fp,e.borderBottomColor),this.borderLeftColor=lA(A,Tp,e.borderLeftColor),this.borderTopLeftRadius=lA(A,Qp,e.borderTopLeftRadius),this.borderTopRightRadius=lA(A,bp,e.borderTopRightRadius),this.borderBottomRightRadius=lA(A,Ip,e.borderBottomRightRadius),this.borderBottomLeftRadius=lA(A,Lp,e.borderBottomLeftRadius),this.borderTopStyle=lA(A,Rp,e.borderTopStyle),this.borderRightStyle=lA(A,Hp,e.borderRightStyle),this.borderBottomStyle=lA(A,Dp,e.borderBottomStyle),this.borderLeftStyle=lA(A,Pp,e.borderLeftStyle),this.borderTopWidth=lA(A,Op,e.borderTopWidth),this.borderRightWidth=lA(A,Np,e.borderRightWidth),this.borderBottomWidth=lA(A,Gp,e.borderBottomWidth),this.borderLeftWidth=lA(A,Vp,e.borderLeftWidth),this.boxShadow=lA(A,Rg,e.boxShadow),this.color=lA(A,Kp,e.color),this.direction=lA(A,kp,e.direction),this.display=lA(A,zp,e.display),this.float=lA(A,Xp,e.cssFloat),this.fontFamily=lA(A,xg,e.fontFamily),this.fontSize=lA(A,yg,e.fontSize),this.fontStyle=lA(A,Fg,e.fontStyle),this.fontVariant=lA(A,Sg,e.fontVariant),this.fontWeight=lA(A,Mg,e.fontWeight),this.letterSpacing=lA(A,Yp,e.letterSpacing),this.lineBreak=lA(A,Jp,e.lineBreak),this.lineHeight=lA(A,Zp,e.lineHeight),this.listStyleImage=lA(A,qp,e.listStyleImage),this.listStylePosition=lA(A,jp,e.listStylePosition),this.listStyleType=lA(A,qa,e.listStyleType),this.marginTop=lA(A,$p,e.marginTop),this.marginRight=lA(A,Ag,e.marginRight),this.marginBottom=lA(A,eg,e.marginBottom),this.marginLeft=lA(A,tg,e.marginLeft),this.opacity=lA(A,Cg,e.opacity);var i=lA(A,rg,e.overflow);this.overflowX=i[0],this.overflowY=i[i.length>1?1:0],this.overflowWrap=lA(A,ng,e.overflowWrap),this.paddingTop=lA(A,ig,e.paddingTop),this.paddingRight=lA(A,ag,e.paddingRight),this.paddingBottom=lA(A,sg,e.paddingBottom),this.paddingLeft=lA(A,og,e.paddingLeft),this.paintOrder=lA(A,Hg,e.paintOrder),this.position=lA(A,cg,e.position),this.textAlign=lA(A,lg,e.textAlign),this.textDecorationColor=lA(A,Eg,(t=e.textDecorationColor)!==null&&t!==void 0?t:e.color),this.textDecorationLine=lA(A,Ug,(n=e.textDecorationLine)!==null&&n!==void 0?n:e.textDecoration),this.textShadow=lA(A,ug,e.textShadow),this.textTransform=lA(A,hg,e.textTransform),this.transform=lA(A,dg,e.transform),this.transformOrigin=lA(A,Bg,e.transformOrigin),this.visibility=lA(A,vg,e.visibility),this.webkitTextStrokeColor=lA(A,Dg,e.webkitTextStrokeColor),this.webkitTextStrokeWidth=lA(A,Pg,e.webkitTextStrokeWidth),this.wordBreak=lA(A,wg,e.wordBreak),this.zIndex=lA(A,_g,e.zIndex)}return r.prototype.isVisible=function(){return this.display>0&&this.opacity>0&&this.visibility===0},r.prototype.isTransparent=function(){return vt(this.backgroundColor)},r.prototype.isTransformed=function(){return this.transform!==null},r.prototype.isPositioned=function(){return this.position!==0},r.prototype.isPositionedWithZIndex=function(){return this.isPositioned()&&!this.zIndex.auto},r.prototype.isFloating=function(){return this.float!==0},r.prototype.isInlineLevel=function(){return jA(this.display,4)||jA(this.display,33554432)||jA(this.display,268435456)||jA(this.display,536870912)||jA(this.display,67108864)||jA(this.display,134217728)},r})(),Ng=(function(){function r(A,e){this.content=lA(A,Tg,e.content),this.quotes=lA(A,Lg,e.quotes)}return r})(),qo=(function(){function r(A,e){this.counterIncrement=lA(A,Qg,e.counterIncrement),this.counterReset=lA(A,bg,e.counterReset)}return r})(),lA=function(r,A,e){var t=new sc,n=e!==null&&typeof e<"u"?e.toString():A.initialValue;t.write(n);var i=new oc(t.read());switch(A.type){case 2:var a=i.parseComponentValue();return A.parse(r,OA(a)?a.value:A.initialValue);case 0:return A.parse(r,i.parseComponentValue());case 1:return A.parse(r,i.parseComponentValues());case 4:return i.parseComponentValue();case 3:switch(A.format){case"angle":return Mi.parse(r,i.parseComponentValue());case"color":return Bt.parse(r,i.parseComponentValue());case"image":return hs.parse(r,i.parseComponentValue());case"length":var o=i.parseComponentValue();return wt(o)?o:ne;case"length-percentage":var s=i.parseComponentValue();return JA(s)?s:ne;case"time":return yc.parse(r,i.parseComponentValue())}break}},Gg="data-html2canvas-debug",Vg=function(r){var A=r.getAttribute(Gg);switch(A){case"all":return 1;case"clone":return 2;case"parse":return 3;case"render":return 4;default:return 0}},ja=function(r,A){var e=Vg(r);return e===1||A===e},Je=(function(){function r(A,e){if(this.context=A,this.textNodes=[],this.elements=[],this.flags=0,ja(e,3))debugger;this.styles=new Og(A,window.getComputedStyle(e,null)),es(e)&&(this.styles.animationDuration.some(function(t){return t>0})&&(e.style.animationDuration="0s"),this.styles.transform!==null&&(e.style.transform="none")),this.bounds=xi(this.context,e),ja(e,4)&&(this.flags|=16)}return r})(),Kg="AAAAAAAAAAAAEA4AGBkAAFAaAAACAAAAAAAIABAAGAAwADgACAAQAAgAEAAIABAACAAQAAgAEAAIABAACAAQAAgAEAAIABAAQABIAEQATAAIABAACAAQAAgAEAAIABAAVABcAAgAEAAIABAACAAQAGAAaABwAHgAgACIAI4AlgAIABAAmwCjAKgAsAC2AL4AvQDFAMoA0gBPAVYBWgEIAAgACACMANoAYgFkAWwBdAF8AX0BhQGNAZUBlgGeAaMBlQGWAasBswF8AbsBwwF0AcsBYwHTAQgA2wG/AOMBdAF8AekB8QF0AfkB+wHiAHQBfAEIAAMC5gQIAAsCEgIIAAgAFgIeAggAIgIpAggAMQI5AkACygEIAAgASAJQAlgCYAIIAAgACAAKBQoFCgUTBRMFGQUrBSsFCAAIAAgACAAIAAgACAAIAAgACABdAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABoAmgCrwGvAQgAbgJ2AggAHgEIAAgACADnAXsCCAAIAAgAgwIIAAgACAAIAAgACACKAggAkQKZAggAPADJAAgAoQKkAqwCsgK6AsICCADJAggA0AIIAAgACAAIANYC3gIIAAgACAAIAAgACABAAOYCCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAkASoB+QIEAAgACAA8AEMCCABCBQgACABJBVAFCAAIAAgACAAIAAgACAAIAAgACABTBVoFCAAIAFoFCABfBWUFCAAIAAgACAAIAAgAbQUIAAgACAAIAAgACABzBXsFfQWFBYoFigWKBZEFigWKBYoFmAWfBaYFrgWxBbkFCAAIAAgACAAIAAgACAAIAAgACAAIAMEFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAMgFCADQBQgACAAIAAgACAAIAAgACAAIAAgACAAIAO4CCAAIAAgAiQAIAAgACABAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAD0AggACAD8AggACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIANYFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAMDvwAIAAgAJAIIAAgACAAIAAgACAAIAAgACwMTAwgACAB9BOsEGwMjAwgAKwMyAwsFYgE3A/MEPwMIAEUDTQNRAwgAWQOsAGEDCAAIAAgACAAIAAgACABpAzQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFIQUoBSwFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABtAwgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABMAEwACAAIAAgACAAIABgACAAIAAgACAC/AAgACAAyAQgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACAAIAAwAAgACAAIAAgACAAIAAgACAAIAAAARABIAAgACAAIABQASAAIAAgAIABwAEAAjgCIABsAqAC2AL0AigDQAtwC+IJIQqVAZUBWQqVAZUBlQGVAZUBlQGrC5UBlQGVAZUBlQGVAZUBlQGVAXsKlQGVAbAK6wsrDGUMpQzlDJUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAfAKAAuZA64AtwCJALoC6ADwAAgAuACgA/oEpgO6AqsD+AAIAAgAswMIAAgACAAIAIkAuwP5AfsBwwPLAwgACAAIAAgACADRA9kDCAAIAOED6QMIAAgACAAIAAgACADuA/YDCAAIAP4DyQAIAAgABgQIAAgAXQAOBAgACAAIAAgACAAIABMECAAIAAgACAAIAAgACAD8AAQBCAAIAAgAGgQiBCoECAExBAgAEAEIAAgACAAIAAgACAAIAAgACAAIAAgACAA4BAgACABABEYECAAIAAgATAQYAQgAVAQIAAgACAAIAAgACAAIAAgACAAIAFoECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAOQEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAB+BAcACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAEABhgSMBAgACAAIAAgAlAQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAwAEAAQABAADAAMAAwADAAQABAAEAAQABAAEAAQABHATAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAdQMIAAgACAAIAAgACAAIAMkACAAIAAgAfQMIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACFA4kDCAAIAAgACAAIAOcBCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAIcDCAAIAAgACAAIAAgACAAIAAgACAAIAJEDCAAIAAgACADFAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABgBAgAZgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAbAQCBXIECAAIAHkECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABAAJwEQACjBKoEsgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAC6BMIECAAIAAgACAAIAAgACABmBAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAxwQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAGYECAAIAAgAzgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBd0FXwUIAOIF6gXxBYoF3gT5BQAGCAaKBYoFigWKBYoFigWKBYoFigWKBYoFigXWBIoFigWKBYoFigWKBYoFigWKBYsFEAaKBYoFigWKBYoFigWKBRQGCACKBYoFigWKBQgACAAIANEECAAIABgGigUgBggAJgYIAC4GMwaKBYoF0wQ3Bj4GigWKBYoFigWKBYoFigWKBYoFigWKBYoFigUIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWLBf///////wQABAAEAAQABAAEAAQABAAEAAQAAwAEAAQAAgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAQADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUAAAAFAAUAAAAFAAUAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAQAAAAUABQAFAAUABQAFAAAAAAAFAAUAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAFAAUAAQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAAABwAHAAcAAAAHAAcABwAFAAEAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAcABwAFAAUAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAQABAAAAAAAAAAAAAAAFAAUABQAFAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAHAAcAAAAHAAcAAAAAAAUABQAHAAUAAQAHAAEABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwABAAUABQAFAAUAAAAAAAAAAAAAAAEAAQABAAEAAQABAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABQANAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAABQAHAAUABQAFAAAAAAAAAAcABQAFAAUABQAFAAQABAAEAAQABAAEAAQABAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUAAAAFAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAUAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAcABwAFAAcABwAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUABwAHAAUABQAFAAUAAAAAAAcABwAAAAAABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAAAAAAAAAAABQAFAAAAAAAFAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAFAAUABQAFAAUAAAAFAAUABwAAAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABwAFAAUABQAFAAAAAAAHAAcAAAAAAAcABwAFAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAAAAAAAAAHAAcABwAAAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAUABQAFAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAHAAcABQAHAAcAAAAFAAcABwAAAAcABwAFAAUAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAFAAcABwAFAAUABQAAAAUAAAAHAAcABwAHAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAHAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUAAAAFAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAUAAAAFAAUAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABwAFAAUABQAFAAUABQAAAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABQAFAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAFAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAHAAUABQAFAAUABQAFAAUABwAHAAcABwAHAAcABwAHAAUABwAHAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABwAHAAcABwAFAAUABwAHAAcAAAAAAAAAAAAHAAcABQAHAAcABwAHAAcABwAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAUABQAFAAUABQAFAAUAAAAFAAAABQAAAAAABQAFAAUABQAFAAUABQAFAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAUABQAFAAUABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABwAFAAcABwAHAAcABwAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAUABQAFAAUABwAHAAUABQAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABQAFAAcABwAHAAUABwAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAcABQAFAAUABQAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAAAAAABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAAAAAAAAAFAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAUABQAHAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAFAAUABQAFAAcABwAFAAUABwAHAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAcABwAFAAUABwAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABQAAAAAABQAFAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAcABwAAAAAAAAAAAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAcABwAFAAcABwAAAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAFAAUABQAAAAUABQAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABwAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAHAAcABQAHAAUABQAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAAABwAHAAAAAAAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAFAAUABwAFAAcABwAFAAcABQAFAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAAAAAABwAHAAcABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAFAAcABwAFAAUABQAFAAUABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAUABQAFAAcABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABQAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAAAAAAFAAUABwAHAAcABwAFAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAHAAUABQAFAAUABQAFAAUABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAABQAAAAUABQAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAHAAcAAAAFAAUAAAAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABQAFAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAABQAFAAUABQAFAAUABQAAAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAFAAUABQAFAAUADgAOAA4ADgAOAA4ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAMAAwADAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAAAAAAAAAAAAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAAAAAAAAAAAAsADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwACwAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAADgAOAA4AAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAAAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4AAAAOAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAAAAAAAAAAAA4AAAAOAAAAAAAAAAAADgAOAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAA=",jo="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Nr=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(var Jn=0;Jn<jo.length;Jn++)Nr[jo.charCodeAt(Jn)]=Jn;var kg=function(r){var A=r.length*.75,e=r.length,t,n=0,i,a,o,s;r[r.length-1]==="="&&(A--,r[r.length-2]==="="&&A--);var l=typeof ArrayBuffer<"u"&&typeof Uint8Array<"u"&&typeof Uint8Array.prototype.slice<"u"?new ArrayBuffer(A):new Array(A),c=Array.isArray(l)?l:new Uint8Array(l);for(t=0;t<e;t+=4)i=Nr[r.charCodeAt(t)],a=Nr[r.charCodeAt(t+1)],o=Nr[r.charCodeAt(t+2)],s=Nr[r.charCodeAt(t+3)],c[n++]=i<<2|a>>4,c[n++]=(a&15)<<4|o>>2,c[n++]=(o&3)<<6|s&63;return l},zg=function(r){for(var A=r.length,e=[],t=0;t<A;t+=2)e.push(r[t+1]<<8|r[t]);return e},Wg=function(r){for(var A=r.length,e=[],t=0;t<A;t+=4)e.push(r[t+3]<<24|r[t+2]<<16|r[t+1]<<8|r[t]);return e},Pt=5,ds=11,_a=2,Xg=ds-Pt,Mc=65536>>Pt,Yg=1<<Pt,Ca=Yg-1,Jg=1024>>Pt,Zg=Mc+Jg,qg=Zg,jg=32,$g=qg+jg,Am=65536>>ds,em=1<<Xg,tm=em-1,$o=function(r,A,e){return r.slice?r.slice(A,e):new Uint16Array(Array.prototype.slice.call(r,A,e))},rm=function(r,A,e){return r.slice?r.slice(A,e):new Uint32Array(Array.prototype.slice.call(r,A,e))},nm=function(r,A){var e=kg(r),t=Array.isArray(e)?Wg(e):new Uint32Array(e),n=Array.isArray(e)?zg(e):new Uint16Array(e),i=24,a=$o(n,i/2,t[4]/2),o=t[5]===2?$o(n,(i+t[4])/2):rm(t,Math.ceil((i+t[4])/4));return new im(t[0],t[1],t[2],t[3],a,o)},im=(function(){function r(A,e,t,n,i,a){this.initialValue=A,this.errorValue=e,this.highStart=t,this.highValueIndex=n,this.index=i,this.data=a}return r.prototype.get=function(A){var e;if(A>=0){if(A<55296||A>56319&&A<=65535)return e=this.index[A>>Pt],e=(e<<_a)+(A&Ca),this.data[e];if(A<=65535)return e=this.index[Mc+(A-55296>>Pt)],e=(e<<_a)+(A&Ca),this.data[e];if(A<this.highStart)return e=$g-Am+(A>>ds),e=this.index[e],e+=A>>Pt&tm,e=this.index[e],e=(e<<_a)+(A&Ca),this.data[e];if(A<=1114111)return this.data[this.highValueIndex]}return this.errorValue},r})(),Al="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",am=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(var Zn=0;Zn<Al.length;Zn++)am[Al.charCodeAt(Zn)]=Zn;var sm=1,Ea=2,Ua=3,el=4,tl=5,om=7,rl=8,xa=9,ya=10,nl=11,il=12,al=13,sl=14,Ma=15,lm=function(r){for(var A=[],e=0,t=r.length;e<t;){var n=r.charCodeAt(e++);if(n>=55296&&n<=56319&&e<t){var i=r.charCodeAt(e++);(i&64512)===56320?A.push(((n&1023)<<10)+(i&1023)+65536):(A.push(n),e--)}else A.push(n)}return A},cm=function(){for(var r=[],A=0;A<arguments.length;A++)r[A]=arguments[A];if(String.fromCodePoint)return String.fromCodePoint.apply(String,r);var e=r.length;if(!e)return"";for(var t=[],n=-1,i="";++n<e;){var a=r[n];a<=65535?t.push(a):(a-=65536,t.push((a>>10)+55296,a%1024+56320)),(n+1===e||t.length>16384)&&(i+=String.fromCharCode.apply(String,t),t.length=0)}return i},um=nm(Kg),Fe="×",Sa="÷",hm=function(r){return um.get(r)},dm=function(r,A,e){var t=e-2,n=A[t],i=A[e-1],a=A[e];if(i===Ea&&a===Ua)return Fe;if(i===Ea||i===Ua||i===el||a===Ea||a===Ua||a===el)return Sa;if(i===rl&&[rl,xa,nl,il].indexOf(a)!==-1||(i===nl||i===xa)&&(a===xa||a===ya)||(i===il||i===ya)&&a===ya||a===al||a===tl||a===om||i===sm)return Fe;if(i===al&&a===sl){for(;n===tl;)n=A[--t];if(n===sl)return Fe}if(i===Ma&&a===Ma){for(var o=0;n===Ma;)o++,n=A[--t];if(o%2===0)return Fe}return Sa},fm=function(r){var A=lm(r),e=A.length,t=0,n=0,i=A.map(hm);return{next:function(){if(t>=e)return{done:!0,value:null};for(var a=Fe;t<e&&(a=dm(A,i,++t))===Fe;);if(a!==Fe||t===e){var o=cm.apply(null,A.slice(n,t));return n=t,{value:o,done:!1}}return{done:!0,value:null}}}},pm=function(r){for(var A=fm(r),e=[],t;!(t=A.next()).done;)t.value&&e.push(t.value.slice());return e},gm=function(r){var A=123;if(r.createRange){var e=r.createRange();if(e.getBoundingClientRect){var t=r.createElement("boundtest");t.style.height=A+"px",t.style.display="block",r.body.appendChild(t),e.selectNode(t);var n=e.getBoundingClientRect(),i=Math.round(n.height);if(r.body.removeChild(t),i===A)return!0}}return!1},mm=function(r){var A=r.createElement("boundtest");A.style.width="50px",A.style.display="block",A.style.fontSize="12px",A.style.letterSpacing="0px",A.style.wordSpacing="0px",r.body.appendChild(A);var e=r.createRange();A.innerHTML=typeof"".repeat=="function"?"&#128104;".repeat(10):"";var t=A.firstChild,n=yi(t.data).map(function(s){return WA(s)}),i=0,a={},o=n.every(function(s,l){e.setStart(t,i),e.setEnd(t,i+s.length);var c=e.getBoundingClientRect();i+=s.length;var u=c.x>a.x||c.y>a.y;return a=c,l===0?!0:u});return r.body.removeChild(A),o},Bm=function(){return typeof new Image().crossOrigin<"u"},vm=function(){return typeof new XMLHttpRequest().responseType=="string"},wm=function(r){var A=new Image,e=r.createElement("canvas"),t=e.getContext("2d");if(!t)return!1;A.src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";try{t.drawImage(A,0,0),e.toDataURL()}catch{return!1}return!0},ol=function(r){return r[0]===0&&r[1]===255&&r[2]===0&&r[3]===255},_m=function(r){var A=r.createElement("canvas"),e=100;A.width=e,A.height=e;var t=A.getContext("2d");if(!t)return Promise.reject(!1);t.fillStyle="rgb(0, 255, 0)",t.fillRect(0,0,e,e);var n=new Image,i=A.toDataURL();n.src=i;var a=$a(e,e,0,0,n);return t.fillStyle="red",t.fillRect(0,0,e,e),ll(a).then(function(o){t.drawImage(o,0,0);var s=t.getImageData(0,0,e,e).data;t.fillStyle="red",t.fillRect(0,0,e,e);var l=r.createElement("div");return l.style.backgroundImage="url("+i+")",l.style.height=e+"px",ol(s)?ll($a(e,e,0,0,l)):Promise.reject(!1)}).then(function(o){return t.drawImage(o,0,0),ol(t.getImageData(0,0,e,e).data)}).catch(function(){return!1})},$a=function(r,A,e,t,n){var i="http://www.w3.org/2000/svg",a=document.createElementNS(i,"svg"),o=document.createElementNS(i,"foreignObject");return a.setAttributeNS(null,"width",r.toString()),a.setAttributeNS(null,"height",A.toString()),o.setAttributeNS(null,"width","100%"),o.setAttributeNS(null,"height","100%"),o.setAttributeNS(null,"x",e.toString()),o.setAttributeNS(null,"y",t.toString()),o.setAttributeNS(null,"externalResourcesRequired","true"),a.appendChild(o),o.appendChild(n),a},ll=function(r){return new Promise(function(A,e){var t=new Image;t.onload=function(){return A(t)},t.onerror=e,t.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(r))})},re={get SUPPORT_RANGE_BOUNDS(){var r=gm(document);return Object.defineProperty(re,"SUPPORT_RANGE_BOUNDS",{value:r}),r},get SUPPORT_WORD_BREAKING(){var r=re.SUPPORT_RANGE_BOUNDS&&mm(document);return Object.defineProperty(re,"SUPPORT_WORD_BREAKING",{value:r}),r},get SUPPORT_SVG_DRAWING(){var r=wm(document);return Object.defineProperty(re,"SUPPORT_SVG_DRAWING",{value:r}),r},get SUPPORT_FOREIGNOBJECT_DRAWING(){var r=typeof Array.from=="function"&&typeof window.fetch=="function"?_m(document):Promise.resolve(!1);return Object.defineProperty(re,"SUPPORT_FOREIGNOBJECT_DRAWING",{value:r}),r},get SUPPORT_CORS_IMAGES(){var r=Bm();return Object.defineProperty(re,"SUPPORT_CORS_IMAGES",{value:r}),r},get SUPPORT_RESPONSE_TYPE(){var r=vm();return Object.defineProperty(re,"SUPPORT_RESPONSE_TYPE",{value:r}),r},get SUPPORT_CORS_XHR(){var r="withCredentials"in new XMLHttpRequest;return Object.defineProperty(re,"SUPPORT_CORS_XHR",{value:r}),r},get SUPPORT_NATIVE_TEXT_SEGMENTATION(){var r=!!(typeof Intl<"u"&&Intl.Segmenter);return Object.defineProperty(re,"SUPPORT_NATIVE_TEXT_SEGMENTATION",{value:r}),r}},Wr=(function(){function r(A,e){this.text=A,this.bounds=e}return r})(),Cm=function(r,A,e,t){var n=xm(A,e),i=[],a=0;return n.forEach(function(o){if(e.textDecorationLine.length||o.trim().length>0)if(re.SUPPORT_RANGE_BOUNDS){var s=cl(t,a,o.length).getClientRects();if(s.length>1){var l=fs(o),c=0;l.forEach(function(h){i.push(new Wr(h,at.fromDOMRectList(r,cl(t,c+a,h.length).getClientRects()))),c+=h.length})}else i.push(new Wr(o,at.fromDOMRectList(r,s)))}else{var u=t.splitText(o.length);i.push(new Wr(o,Em(r,t))),t=u}else re.SUPPORT_RANGE_BOUNDS||(t=t.splitText(o.length));a+=o.length}),i},Em=function(r,A){var e=A.ownerDocument;if(e){var t=e.createElement("html2canvaswrapper");t.appendChild(A.cloneNode(!0));var n=A.parentNode;if(n){n.replaceChild(t,A);var i=xi(r,t);return t.firstChild&&n.replaceChild(t.firstChild,t),i}}return at.EMPTY},cl=function(r,A,e){var t=r.ownerDocument;if(!t)throw new Error("Node has no owner document");var n=t.createRange();return n.setStart(r,A),n.setEnd(r,A+e),n},fs=function(r){if(re.SUPPORT_NATIVE_TEXT_SEGMENTATION){var A=new Intl.Segmenter(void 0,{granularity:"grapheme"});return Array.from(A.segment(r)).map(function(e){return e.segment})}return pm(r)},Um=function(r,A){if(re.SUPPORT_NATIVE_TEXT_SEGMENTATION){var e=new Intl.Segmenter(void 0,{granularity:"word"});return Array.from(e.segment(r)).map(function(t){return t.segment})}return Mm(r,A)},xm=function(r,A){return A.letterSpacing!==0?fs(r):Um(r,A)},ym=[32,160,4961,65792,65793,4153,4241],Mm=function(r,A){for(var e=$d(r,{lineBreak:A.lineBreak,wordBreak:A.overflowWrap==="break-word"?"break-word":A.wordBreak}),t=[],n,i=function(){if(n.value){var a=n.value.slice(),o=yi(a),s="";o.forEach(function(l){ym.indexOf(l)===-1?s+=WA(l):(s.length&&t.push(s),t.push(WA(l)),s="")}),s.length&&t.push(s)}};!(n=e.next()).done;)i();return t},Sm=(function(){function r(A,e,t){this.text=Fm(e.data,t.textTransform),this.textBounds=Cm(A,this.text,t,e)}return r})(),Fm=function(r,A){switch(A){case 1:return r.toLowerCase();case 3:return r.replace(Tm,Qm);case 2:return r.toUpperCase();default:return r}},Tm=/(^|\s|:|-|\(|\))([a-z])/g,Qm=function(r,A,e){return r.length>0?A+e.toUpperCase():r},Sc=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this;return n.src=t.currentSrc||t.src,n.intrinsicWidth=t.naturalWidth,n.intrinsicHeight=t.naturalHeight,n.context.cache.addImage(n.src),n}return A})(Je),Fc=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this;return n.canvas=t,n.intrinsicWidth=t.width,n.intrinsicHeight=t.height,n}return A})(Je),Tc=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this,i=new XMLSerializer,a=xi(e,t);return t.setAttribute("width",a.width+"px"),t.setAttribute("height",a.height+"px"),n.svg="data:image/svg+xml,"+encodeURIComponent(i.serializeToString(t)),n.intrinsicWidth=t.width.baseVal.value,n.intrinsicHeight=t.height.baseVal.value,n.context.cache.addImage(n.svg),n}return A})(Je),Qc=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this;return n.value=t.value,n}return A})(Je),As=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this;return n.start=t.start,n.reversed=typeof t.reversed=="boolean"&&t.reversed===!0,n}return A})(Je),bm=[{type:15,flags:0,unit:"px",number:3}],Im=[{type:16,flags:0,number:50}],Lm=function(r){return r.width>r.height?new at(r.left+(r.width-r.height)/2,r.top,r.height,r.height):r.width<r.height?new at(r.left,r.top+(r.height-r.width)/2,r.width,r.width):r},Rm=function(r){var A=r.type===Hm?new Array(r.value.length+1).join("•"):r.value;return A.length===0?r.placeholder||"":A},hi="checkbox",di="radio",Hm="password",ul=707406591,ps=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this;switch(n.type=t.type.toLowerCase(),n.checked=t.checked,n.value=Rm(t),(n.type===hi||n.type===di)&&(n.styles.backgroundColor=3739148031,n.styles.borderTopColor=n.styles.borderRightColor=n.styles.borderBottomColor=n.styles.borderLeftColor=2779096575,n.styles.borderTopWidth=n.styles.borderRightWidth=n.styles.borderBottomWidth=n.styles.borderLeftWidth=1,n.styles.borderTopStyle=n.styles.borderRightStyle=n.styles.borderBottomStyle=n.styles.borderLeftStyle=1,n.styles.backgroundClip=[0],n.styles.backgroundOrigin=[0],n.bounds=Lm(n.bounds)),n.type){case hi:n.styles.borderTopRightRadius=n.styles.borderTopLeftRadius=n.styles.borderBottomRightRadius=n.styles.borderBottomLeftRadius=bm;break;case di:n.styles.borderTopRightRadius=n.styles.borderTopLeftRadius=n.styles.borderBottomRightRadius=n.styles.borderBottomLeftRadius=Im;break}return n}return A})(Je),bc=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this,i=t.options[t.selectedIndex||0];return n.value=i&&i.text||"",n}return A})(Je),Ic=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this;return n.value=t.value,n}return A})(Je),Lc=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this;n.src=t.src,n.width=parseInt(t.width,10)||0,n.height=parseInt(t.height,10)||0,n.backgroundColor=n.styles.backgroundColor;try{if(t.contentWindow&&t.contentWindow.document&&t.contentWindow.document.documentElement){n.tree=Hc(e,t.contentWindow.document.documentElement);var i=t.contentWindow.document.documentElement?kr(e,getComputedStyle(t.contentWindow.document.documentElement).backgroundColor):nt.TRANSPARENT,a=t.contentWindow.document.body?kr(e,getComputedStyle(t.contentWindow.document.body).backgroundColor):nt.TRANSPARENT;n.backgroundColor=vt(i)?vt(a)?n.styles.backgroundColor:a:i}}catch{}return n}return A})(Je),Dm=["OL","UL","MENU"],ni=function(r,A,e,t){for(var n=A.firstChild,i=void 0;n;n=i)if(i=n.nextSibling,Dc(n)&&n.data.trim().length>0)e.textNodes.push(new Sm(r,n,e.styles));else if(dr(n))if(Gc(n)&&n.assignedNodes)n.assignedNodes().forEach(function(o){return ni(r,o,e,t)});else{var a=Rc(r,n);a.styles.isVisible()&&(Pm(n,a,t)?a.flags|=4:Om(a.styles)&&(a.flags|=2),Dm.indexOf(n.tagName)!==-1&&(a.flags|=8),e.elements.push(a),n.slot,n.shadowRoot?ni(r,n.shadowRoot,a,t):!fi(n)&&!Pc(n)&&!pi(n)&&ni(r,n,a,t))}},Rc=function(r,A){return ts(A)?new Sc(r,A):Oc(A)?new Fc(r,A):Pc(A)?new Tc(r,A):Nm(A)?new Qc(r,A):Gm(A)?new As(r,A):Vm(A)?new ps(r,A):pi(A)?new bc(r,A):fi(A)?new Ic(r,A):Nc(A)?new Lc(r,A):new Je(r,A)},Hc=function(r,A){var e=Rc(r,A);return e.flags|=4,ni(r,A,e,e),e},Pm=function(r,A,e){return A.styles.isPositionedWithZIndex()||A.styles.opacity<1||A.styles.isTransformed()||gs(r)&&e.styles.isTransparent()},Om=function(r){return r.isPositioned()||r.isFloating()},Dc=function(r){return r.nodeType===Node.TEXT_NODE},dr=function(r){return r.nodeType===Node.ELEMENT_NODE},es=function(r){return dr(r)&&typeof r.style<"u"&&!ii(r)},ii=function(r){return typeof r.className=="object"},Nm=function(r){return r.tagName==="LI"},Gm=function(r){return r.tagName==="OL"},Vm=function(r){return r.tagName==="INPUT"},Km=function(r){return r.tagName==="HTML"},Pc=function(r){return r.tagName==="svg"},gs=function(r){return r.tagName==="BODY"},Oc=function(r){return r.tagName==="CANVAS"},hl=function(r){return r.tagName==="VIDEO"},ts=function(r){return r.tagName==="IMG"},Nc=function(r){return r.tagName==="IFRAME"},dl=function(r){return r.tagName==="STYLE"},km=function(r){return r.tagName==="SCRIPT"},fi=function(r){return r.tagName==="TEXTAREA"},pi=function(r){return r.tagName==="SELECT"},Gc=function(r){return r.tagName==="SLOT"},fl=function(r){return r.tagName.indexOf("-")>0},zm=(function(){function r(){this.counters={}}return r.prototype.getCounterValue=function(A){var e=this.counters[A];return e&&e.length?e[e.length-1]:1},r.prototype.getCounterValues=function(A){var e=this.counters[A];return e||[]},r.prototype.pop=function(A){var e=this;A.forEach(function(t){return e.counters[t].pop()})},r.prototype.parse=function(A){var e=this,t=A.counterIncrement,n=A.counterReset,i=!0;t!==null&&t.forEach(function(o){var s=e.counters[o.counter];s&&o.increment!==0&&(i=!1,s.length||s.push(1),s[Math.max(0,s.length-1)]+=o.increment)});var a=[];return i&&n.forEach(function(o){var s=e.counters[o.counter];a.push(o.counter),s||(s=e.counters[o.counter]=[]),s.push(o.reset)}),a},r})(),pl={integers:[1e3,900,500,400,100,90,50,40,10,9,5,4,1],values:["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"]},gl={integers:[9e3,8e3,7e3,6e3,5e3,4e3,3e3,2e3,1e3,900,800,700,600,500,400,300,200,100,90,80,70,60,50,40,30,20,10,9,8,7,6,5,4,3,2,1],values:["Ք","Փ","Ւ","Ց","Ր","Տ","Վ","Ս","Ռ","Ջ","Պ","Չ","Ո","Շ","Ն","Յ","Մ","Ճ","Ղ","Ձ","Հ","Կ","Ծ","Խ","Լ","Ի","Ժ","Թ","Ը","Է","Զ","Ե","Դ","Գ","Բ","Ա"]},Wm={integers:[1e4,9e3,8e3,7e3,6e3,5e3,4e3,3e3,2e3,1e3,400,300,200,100,90,80,70,60,50,40,30,20,19,18,17,16,15,10,9,8,7,6,5,4,3,2,1],values:["י׳","ט׳","ח׳","ז׳","ו׳","ה׳","ד׳","ג׳","ב׳","א׳","ת","ש","ר","ק","צ","פ","ע","ס","נ","מ","ל","כ","יט","יח","יז","טז","טו","י","ט","ח","ז","ו","ה","ד","ג","ב","א"]},Xm={integers:[1e4,9e3,8e3,7e3,6e3,5e3,4e3,3e3,2e3,1e3,900,800,700,600,500,400,300,200,100,90,80,70,60,50,40,30,20,10,9,8,7,6,5,4,3,2,1],values:["ჵ","ჰ","ჯ","ჴ","ხ","ჭ","წ","ძ","ც","ჩ","შ","ყ","ღ","ქ","ფ","ჳ","ტ","ს","რ","ჟ","პ","ო","ჲ","ნ","მ","ლ","კ","ი","თ","ჱ","ზ","ვ","ე","დ","გ","ბ","ა"]},or=function(r,A,e,t,n,i){return r<A||r>e?Zr(r,n,i.length>0):t.integers.reduce(function(a,o,s){for(;r>=o;)r-=o,a+=t.values[s];return a},"")+i},Vc=function(r,A,e,t){var n="";do e||r--,n=t(r)+n,r/=A;while(r*A>=A);return n},zA=function(r,A,e,t,n){var i=e-A+1;return(r<0?"-":"")+(Vc(Math.abs(r),i,t,function(a){return WA(Math.floor(a%i)+A)})+n)},Qt=function(r,A,e){e===void 0&&(e=". ");var t=A.length;return Vc(Math.abs(r),t,!1,function(n){return A[Math.floor(n%t)]})+e},ur=1,ht=2,dt=4,Gr=8,rt=function(r,A,e,t,n,i){if(r<-9999||r>9999)return Zr(r,4,n.length>0);var a=Math.abs(r),o=n;if(a===0)return A[0]+o;for(var s=0;a>0&&s<=4;s++){var l=a%10;l===0&&jA(i,ur)&&o!==""?o=A[l]+o:l>1||l===1&&s===0||l===1&&s===1&&jA(i,ht)||l===1&&s===1&&jA(i,dt)&&r>100||l===1&&s>1&&jA(i,Gr)?o=A[l]+(s>0?e[s-1]:"")+o:l===1&&s>0&&(o=e[s-1]+o),a=Math.floor(a/10)}return(r<0?t:"")+o},ml="十百千萬",Bl="拾佰仟萬",vl="マイナス",Fa="마이너스",Zr=function(r,A,e){var t=e?". ":"",n=e?"、":"",i=e?", ":"",a=e?" ":"";switch(A){case 0:return"•"+a;case 1:return"◦"+a;case 2:return"◾"+a;case 5:var o=zA(r,48,57,!0,t);return o.length<4?"0"+o:o;case 4:return Qt(r,"〇一二三四五六七八九",n);case 6:return or(r,1,3999,pl,3,t).toLowerCase();case 7:return or(r,1,3999,pl,3,t);case 8:return zA(r,945,969,!1,t);case 9:return zA(r,97,122,!1,t);case 10:return zA(r,65,90,!1,t);case 11:return zA(r,1632,1641,!0,t);case 12:case 49:return or(r,1,9999,gl,3,t);case 35:return or(r,1,9999,gl,3,t).toLowerCase();case 13:return zA(r,2534,2543,!0,t);case 14:case 30:return zA(r,6112,6121,!0,t);case 15:return Qt(r,"子丑寅卯辰巳午未申酉戌亥",n);case 16:return Qt(r,"甲乙丙丁戊己庚辛壬癸",n);case 17:case 48:return rt(r,"零一二三四五六七八九",ml,"負",n,ht|dt|Gr);case 47:return rt(r,"零壹貳參肆伍陸柒捌玖",Bl,"負",n,ur|ht|dt|Gr);case 42:return rt(r,"零一二三四五六七八九",ml,"负",n,ht|dt|Gr);case 41:return rt(r,"零壹贰叁肆伍陆柒捌玖",Bl,"负",n,ur|ht|dt|Gr);case 26:return rt(r,"〇一二三四五六七八九","十百千万",vl,n,0);case 25:return rt(r,"零壱弐参四伍六七八九","拾百千万",vl,n,ur|ht|dt);case 31:return rt(r,"영일이삼사오육칠팔구","십백천만",Fa,i,ur|ht|dt);case 33:return rt(r,"零一二三四五六七八九","十百千萬",Fa,i,0);case 32:return rt(r,"零壹貳參四五六七八九","拾百千",Fa,i,ur|ht|dt);case 18:return zA(r,2406,2415,!0,t);case 20:return or(r,1,19999,Xm,3,t);case 21:return zA(r,2790,2799,!0,t);case 22:return zA(r,2662,2671,!0,t);case 22:return or(r,1,10999,Wm,3,t);case 23:return Qt(r,"あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん");case 24:return Qt(r,"いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす");case 27:return zA(r,3302,3311,!0,t);case 28:return Qt(r,"アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン",n);case 29:return Qt(r,"イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス",n);case 34:return zA(r,3792,3801,!0,t);case 37:return zA(r,6160,6169,!0,t);case 38:return zA(r,4160,4169,!0,t);case 39:return zA(r,2918,2927,!0,t);case 40:return zA(r,1776,1785,!0,t);case 43:return zA(r,3046,3055,!0,t);case 44:return zA(r,3174,3183,!0,t);case 45:return zA(r,3664,3673,!0,t);case 46:return zA(r,3872,3881,!0,t);default:return zA(r,48,57,!0,t)}},Kc="data-html2canvas-ignore",wl=(function(){function r(A,e,t){if(this.context=A,this.options=t,this.scrolledElements=[],this.referenceElement=e,this.counters=new zm,this.quoteDepth=0,!e.ownerDocument)throw new Error("Cloned element does not have an owner document");this.documentElement=this.cloneNode(e.ownerDocument.documentElement,!1)}return r.prototype.toIFrame=function(A,e){var t=this,n=Ym(A,e);if(!n.contentWindow)return Promise.reject("Unable to find iframe window");var i=A.defaultView.pageXOffset,a=A.defaultView.pageYOffset,o=n.contentWindow,s=o.document,l=qm(n).then(function(){return fe(t,void 0,void 0,function(){var c,u;return le(this,function(h){switch(h.label){case 0:return this.scrolledElements.forEach(eB),o&&(o.scrollTo(e.left,e.top),/(iPad|iPhone|iPod)/g.test(navigator.userAgent)&&(o.scrollY!==e.top||o.scrollX!==e.left)&&(this.context.logger.warn("Unable to restore scroll position for cloned document"),this.context.windowBounds=this.context.windowBounds.add(o.scrollX-e.left,o.scrollY-e.top,0,0))),c=this.options.onclone,u=this.clonedReferenceElement,typeof u>"u"?[2,Promise.reject("Error finding the "+this.referenceElement.nodeName+" in the cloned document")]:s.fonts&&s.fonts.ready?[4,s.fonts.ready]:[3,2];case 1:h.sent(),h.label=2;case 2:return/(AppleWebKit)/g.test(navigator.userAgent)?[4,Zm(s)]:[3,4];case 3:h.sent(),h.label=4;case 4:return typeof c=="function"?[2,Promise.resolve().then(function(){return c(s,u)}).then(function(){return n})]:[2,n]}})})});return s.open(),s.write($m(document.doctype)+"<html></html>"),AB(this.referenceElement.ownerDocument,i,a),s.replaceChild(s.adoptNode(this.documentElement),s.documentElement),s.close(),l},r.prototype.createElementClone=function(A){if(ja(A,2))debugger;if(Oc(A))return this.createCanvasClone(A);if(hl(A))return this.createVideoClone(A);if(dl(A))return this.createStyleClone(A);var e=A.cloneNode(!1);return ts(e)&&(ts(A)&&A.currentSrc&&A.currentSrc!==A.src&&(e.src=A.currentSrc,e.srcset=""),e.loading==="lazy"&&(e.loading="eager")),fl(e)?this.createCustomElementClone(e):e},r.prototype.createCustomElementClone=function(A){var e=document.createElement("html2canvascustomelement");return Ta(A.style,e),e},r.prototype.createStyleClone=function(A){try{var e=A.sheet;if(e&&e.cssRules){var t=[].slice.call(e.cssRules,0).reduce(function(i,a){return a&&typeof a.cssText=="string"?i+a.cssText:i},""),n=A.cloneNode(!1);return n.textContent=t,n}}catch(i){if(this.context.logger.error("Unable to access cssRules property",i),i.name!=="SecurityError")throw i}return A.cloneNode(!1)},r.prototype.createCanvasClone=function(A){var e;if(this.options.inlineImages&&A.ownerDocument){var t=A.ownerDocument.createElement("img");try{return t.src=A.toDataURL(),t}catch{this.context.logger.info("Unable to inline canvas contents, canvas is tainted",A)}}var n=A.cloneNode(!1);try{n.width=A.width,n.height=A.height;var i=A.getContext("2d"),a=n.getContext("2d");if(a)if(!this.options.allowTaint&&i)a.putImageData(i.getImageData(0,0,A.width,A.height),0,0);else{var o=(e=A.getContext("webgl2"))!==null&&e!==void 0?e:A.getContext("webgl");if(o){var s=o.getContextAttributes();s?.preserveDrawingBuffer===!1&&this.context.logger.warn("Unable to clone WebGL context as it has preserveDrawingBuffer=false",A)}a.drawImage(A,0,0)}return n}catch{this.context.logger.info("Unable to clone canvas as it is tainted",A)}return n},r.prototype.createVideoClone=function(A){var e=A.ownerDocument.createElement("canvas");e.width=A.offsetWidth,e.height=A.offsetHeight;var t=e.getContext("2d");try{return t&&(t.drawImage(A,0,0,e.width,e.height),this.options.allowTaint||t.getImageData(0,0,e.width,e.height)),e}catch{this.context.logger.info("Unable to clone video as it is tainted",A)}var n=A.ownerDocument.createElement("canvas");return n.width=A.offsetWidth,n.height=A.offsetHeight,n},r.prototype.appendChildNode=function(A,e,t){(!dr(e)||!km(e)&&!e.hasAttribute(Kc)&&(typeof this.options.ignoreElements!="function"||!this.options.ignoreElements(e)))&&(!this.options.copyStyles||!dr(e)||!dl(e))&&A.appendChild(this.cloneNode(e,t))},r.prototype.cloneChildNodes=function(A,e,t){for(var n=this,i=A.shadowRoot?A.shadowRoot.firstChild:A.firstChild;i;i=i.nextSibling)if(dr(i)&&Gc(i)&&typeof i.assignedNodes=="function"){var a=i.assignedNodes();a.length&&a.forEach(function(o){return n.appendChildNode(e,o,t)})}else this.appendChildNode(e,i,t)},r.prototype.cloneNode=function(A,e){if(Dc(A))return document.createTextNode(A.data);if(!A.ownerDocument)return A.cloneNode(!1);var t=A.ownerDocument.defaultView;if(t&&dr(A)&&(es(A)||ii(A))){var n=this.createElementClone(A);n.style.transitionProperty="none";var i=t.getComputedStyle(A),a=t.getComputedStyle(A,":before"),o=t.getComputedStyle(A,":after");this.referenceElement===A&&es(n)&&(this.clonedReferenceElement=n),gs(n)&&nB(n);var s=this.counters.parse(new qo(this.context,i)),l=this.resolvePseudoContent(A,n,a,Xr.BEFORE);fl(A)&&(e=!0),hl(A)||this.cloneChildNodes(A,n,e),l&&n.insertBefore(l,n.firstChild);var c=this.resolvePseudoContent(A,n,o,Xr.AFTER);return c&&n.appendChild(c),this.counters.pop(s),(i&&(this.options.copyStyles||ii(A))&&!Nc(A)||e)&&Ta(i,n),(A.scrollTop!==0||A.scrollLeft!==0)&&this.scrolledElements.push([n,A.scrollLeft,A.scrollTop]),(fi(A)||pi(A))&&(fi(n)||pi(n))&&(n.value=A.value),n}return A.cloneNode(!1)},r.prototype.resolvePseudoContent=function(A,e,t,n){var i=this;if(t){var a=t.content,o=e.ownerDocument;if(!(!o||!a||a==="none"||a==="-moz-alt-content"||t.display==="none")){this.counters.parse(new qo(this.context,t));var s=new Ng(this.context,t),l=o.createElement("html2canvaspseudoelement");Ta(t,l),s.content.forEach(function(u){if(u.type===0)l.appendChild(o.createTextNode(u.value));else if(u.type===22){var h=o.createElement("img");h.src=u.value,h.style.opacity="1",l.appendChild(h)}else if(u.type===18){if(u.name==="attr"){var d=u.values.filter(OA);d.length&&l.appendChild(o.createTextNode(A.getAttribute(d[0].value)||""))}else if(u.name==="counter"){var g=u.values.filter(mr),m=g[0],f=g[1];if(m&&OA(m)){var v=i.counters.getCounterValue(m.value),p=f&&OA(f)?qa.parse(i.context,f.value):3;l.appendChild(o.createTextNode(Zr(v,p,!1)))}}else if(u.name==="counters"){var B=u.values.filter(mr),m=B[0],T=B[1],f=B[2];if(m&&OA(m)){var S=i.counters.getCounterValues(m.value),E=f&&OA(f)?qa.parse(i.context,f.value):3,x=T&&T.type===0?T.value:"",I=S.map(function(j){return Zr(j,E,!1)}).join(x);l.appendChild(o.createTextNode(I))}}}else if(u.type===20)switch(u.value){case"open-quote":l.appendChild(o.createTextNode(Zo(s.quotes,i.quoteDepth++,!0)));break;case"close-quote":l.appendChild(o.createTextNode(Zo(s.quotes,--i.quoteDepth,!1)));break;default:l.appendChild(o.createTextNode(u.value))}}),l.className=rs+" "+ns;var c=n===Xr.BEFORE?" "+rs:" "+ns;return ii(e)?e.className.baseValue+=c:e.className+=c,l}}},r.destroy=function(A){return A.parentNode?(A.parentNode.removeChild(A),!0):!1},r})(),Xr;(function(r){r[r.BEFORE=0]="BEFORE",r[r.AFTER=1]="AFTER"})(Xr||(Xr={}));var Ym=function(r,A){var e=r.createElement("iframe");return e.className="html2canvas-container",e.style.visibility="hidden",e.style.position="fixed",e.style.left="-10000px",e.style.top="0px",e.style.border="0",e.width=A.width.toString(),e.height=A.height.toString(),e.scrolling="no",e.setAttribute(Kc,"true"),r.body.appendChild(e),e},Jm=function(r){return new Promise(function(A){if(r.complete){A();return}if(!r.src){A();return}r.onload=A,r.onerror=A})},Zm=function(r){return Promise.all([].slice.call(r.images,0).map(Jm))},qm=function(r){return new Promise(function(A,e){var t=r.contentWindow;if(!t)return e("No window assigned for iframe");var n=t.document;t.onload=r.onload=function(){t.onload=r.onload=null;var i=setInterval(function(){n.body.childNodes.length>0&&n.readyState==="complete"&&(clearInterval(i),A(r))},50)}})},jm=["all","d","content"],Ta=function(r,A){for(var e=r.length-1;e>=0;e--){var t=r.item(e);jm.indexOf(t)===-1&&A.style.setProperty(t,r.getPropertyValue(t))}return A},$m=function(r){var A="";return r&&(A+="<!DOCTYPE ",r.name&&(A+=r.name),r.internalSubset&&(A+=r.internalSubset),r.publicId&&(A+='"'+r.publicId+'"'),r.systemId&&(A+='"'+r.systemId+'"'),A+=">"),A},AB=function(r,A,e){r&&r.defaultView&&(A!==r.defaultView.pageXOffset||e!==r.defaultView.pageYOffset)&&r.defaultView.scrollTo(A,e)},eB=function(r){var A=r[0],e=r[1],t=r[2];A.scrollLeft=e,A.scrollTop=t},tB=":before",rB=":after",rs="___html2canvas___pseudoelement_before",ns="___html2canvas___pseudoelement_after",_l=`{
    content: "" !important;
    display: none !important;
}`,nB=function(r){iB(r,"."+rs+tB+_l+`
         .`+ns+rB+_l)},iB=function(r,A){var e=r.ownerDocument;if(e){var t=e.createElement("style");t.textContent=A,r.appendChild(t)}},kc=(function(){function r(){}return r.getOrigin=function(A){var e=r._link;return e?(e.href=A,e.href=e.href,e.protocol+e.hostname+e.port):"about:blank"},r.isSameOrigin=function(A){return r.getOrigin(A)===r._origin},r.setContext=function(A){r._link=A.document.createElement("a"),r._origin=r.getOrigin(A.location.href)},r._origin="about:blank",r})(),aB=(function(){function r(A,e){this.context=A,this._options=e,this._cache={}}return r.prototype.addImage=function(A){var e=Promise.resolve();return this.has(A)||(ba(A)||cB(A))&&(this._cache[A]=this.loadImage(A)).catch(function(){}),e},r.prototype.match=function(A){return this._cache[A]},r.prototype.loadImage=function(A){return fe(this,void 0,void 0,function(){var e,t,n,i,a=this;return le(this,function(o){switch(o.label){case 0:return e=kc.isSameOrigin(A),t=!Qa(A)&&this._options.useCORS===!0&&re.SUPPORT_CORS_IMAGES&&!e,n=!Qa(A)&&!e&&!ba(A)&&typeof this._options.proxy=="string"&&re.SUPPORT_CORS_XHR&&!t,!e&&this._options.allowTaint===!1&&!Qa(A)&&!ba(A)&&!n&&!t?[2]:(i=A,n?[4,this.proxy(i)]:[3,2]);case 1:i=o.sent(),o.label=2;case 2:return this.context.logger.debug("Added image "+A.substring(0,256)),[4,new Promise(function(s,l){var c=new Image;c.onload=function(){return s(c)},c.onerror=l,(uB(i)||t)&&(c.crossOrigin="anonymous"),c.src=i,c.complete===!0&&setTimeout(function(){return s(c)},500),a._options.imageTimeout>0&&setTimeout(function(){return l("Timed out ("+a._options.imageTimeout+"ms) loading image")},a._options.imageTimeout)})];case 3:return[2,o.sent()]}})})},r.prototype.has=function(A){return typeof this._cache[A]<"u"},r.prototype.keys=function(){return Promise.resolve(Object.keys(this._cache))},r.prototype.proxy=function(A){var e=this,t=this._options.proxy;if(!t)throw new Error("No proxy defined");var n=A.substring(0,256);return new Promise(function(i,a){var o=re.SUPPORT_RESPONSE_TYPE?"blob":"text",s=new XMLHttpRequest;s.onload=function(){if(s.status===200)if(o==="text")i(s.response);else{var u=new FileReader;u.addEventListener("load",function(){return i(u.result)},!1),u.addEventListener("error",function(h){return a(h)},!1),u.readAsDataURL(s.response)}else a("Failed to proxy resource "+n+" with status code "+s.status)},s.onerror=a;var l=t.indexOf("?")>-1?"&":"?";if(s.open("GET",""+t+l+"url="+encodeURIComponent(A)+"&responseType="+o),o!=="text"&&s instanceof XMLHttpRequest&&(s.responseType=o),e._options.imageTimeout){var c=e._options.imageTimeout;s.timeout=c,s.ontimeout=function(){return a("Timed out ("+c+"ms) proxying "+n)}}s.send()})},r})(),sB=/^data:image\/svg\+xml/i,oB=/^data:image\/.*;base64,/i,lB=/^data:image\/.*/i,cB=function(r){return re.SUPPORT_SVG_DRAWING||!hB(r)},Qa=function(r){return lB.test(r)},uB=function(r){return oB.test(r)},ba=function(r){return r.substr(0,4)==="blob"},hB=function(r){return r.substr(-3).toLowerCase()==="svg"||sB.test(r)},oA=(function(){function r(A,e){this.type=0,this.x=A,this.y=e}return r.prototype.add=function(A,e){return new r(this.x+A,this.y+e)},r})(),lr=function(r,A,e){return new oA(r.x+(A.x-r.x)*e,r.y+(A.y-r.y)*e)},qn=(function(){function r(A,e,t,n){this.type=1,this.start=A,this.startControl=e,this.endControl=t,this.end=n}return r.prototype.subdivide=function(A,e){var t=lr(this.start,this.startControl,A),n=lr(this.startControl,this.endControl,A),i=lr(this.endControl,this.end,A),a=lr(t,n,A),o=lr(n,i,A),s=lr(a,o,A);return e?new r(this.start,t,a,s):new r(s,o,i,this.end)},r.prototype.add=function(A,e){return new r(this.start.add(A,e),this.startControl.add(A,e),this.endControl.add(A,e),this.end.add(A,e))},r.prototype.reverse=function(){return new r(this.end,this.endControl,this.startControl,this.start)},r})(),Qe=function(r){return r.type===1},dB=(function(){function r(A){var e=A.styles,t=A.bounds,n=Or(e.borderTopLeftRadius,t.width,t.height),i=n[0],a=n[1],o=Or(e.borderTopRightRadius,t.width,t.height),s=o[0],l=o[1],c=Or(e.borderBottomRightRadius,t.width,t.height),u=c[0],h=c[1],d=Or(e.borderBottomLeftRadius,t.width,t.height),g=d[0],m=d[1],f=[];f.push((i+s)/t.width),f.push((g+u)/t.width),f.push((a+m)/t.height),f.push((l+h)/t.height);var v=Math.max.apply(Math,f);v>1&&(i/=v,a/=v,s/=v,l/=v,u/=v,h/=v,g/=v,m/=v);var p=t.width-s,B=t.height-h,T=t.width-u,S=t.height-m,E=e.borderTopWidth,x=e.borderRightWidth,I=e.borderBottomWidth,M=e.borderLeftWidth,L=NA(e.paddingTop,A.bounds.width),j=NA(e.paddingRight,A.bounds.width),y=NA(e.paddingBottom,A.bounds.width),H=NA(e.paddingLeft,A.bounds.width);this.topLeftBorderDoubleOuterBox=i>0||a>0?VA(t.left+M/3,t.top+E/3,i-M/3,a-E/3,DA.TOP_LEFT):new oA(t.left+M/3,t.top+E/3),this.topRightBorderDoubleOuterBox=i>0||a>0?VA(t.left+p,t.top+E/3,s-x/3,l-E/3,DA.TOP_RIGHT):new oA(t.left+t.width-x/3,t.top+E/3),this.bottomRightBorderDoubleOuterBox=u>0||h>0?VA(t.left+T,t.top+B,u-x/3,h-I/3,DA.BOTTOM_RIGHT):new oA(t.left+t.width-x/3,t.top+t.height-I/3),this.bottomLeftBorderDoubleOuterBox=g>0||m>0?VA(t.left+M/3,t.top+S,g-M/3,m-I/3,DA.BOTTOM_LEFT):new oA(t.left+M/3,t.top+t.height-I/3),this.topLeftBorderDoubleInnerBox=i>0||a>0?VA(t.left+M*2/3,t.top+E*2/3,i-M*2/3,a-E*2/3,DA.TOP_LEFT):new oA(t.left+M*2/3,t.top+E*2/3),this.topRightBorderDoubleInnerBox=i>0||a>0?VA(t.left+p,t.top+E*2/3,s-x*2/3,l-E*2/3,DA.TOP_RIGHT):new oA(t.left+t.width-x*2/3,t.top+E*2/3),this.bottomRightBorderDoubleInnerBox=u>0||h>0?VA(t.left+T,t.top+B,u-x*2/3,h-I*2/3,DA.BOTTOM_RIGHT):new oA(t.left+t.width-x*2/3,t.top+t.height-I*2/3),this.bottomLeftBorderDoubleInnerBox=g>0||m>0?VA(t.left+M*2/3,t.top+S,g-M*2/3,m-I*2/3,DA.BOTTOM_LEFT):new oA(t.left+M*2/3,t.top+t.height-I*2/3),this.topLeftBorderStroke=i>0||a>0?VA(t.left+M/2,t.top+E/2,i-M/2,a-E/2,DA.TOP_LEFT):new oA(t.left+M/2,t.top+E/2),this.topRightBorderStroke=i>0||a>0?VA(t.left+p,t.top+E/2,s-x/2,l-E/2,DA.TOP_RIGHT):new oA(t.left+t.width-x/2,t.top+E/2),this.bottomRightBorderStroke=u>0||h>0?VA(t.left+T,t.top+B,u-x/2,h-I/2,DA.BOTTOM_RIGHT):new oA(t.left+t.width-x/2,t.top+t.height-I/2),this.bottomLeftBorderStroke=g>0||m>0?VA(t.left+M/2,t.top+S,g-M/2,m-I/2,DA.BOTTOM_LEFT):new oA(t.left+M/2,t.top+t.height-I/2),this.topLeftBorderBox=i>0||a>0?VA(t.left,t.top,i,a,DA.TOP_LEFT):new oA(t.left,t.top),this.topRightBorderBox=s>0||l>0?VA(t.left+p,t.top,s,l,DA.TOP_RIGHT):new oA(t.left+t.width,t.top),this.bottomRightBorderBox=u>0||h>0?VA(t.left+T,t.top+B,u,h,DA.BOTTOM_RIGHT):new oA(t.left+t.width,t.top+t.height),this.bottomLeftBorderBox=g>0||m>0?VA(t.left,t.top+S,g,m,DA.BOTTOM_LEFT):new oA(t.left,t.top+t.height),this.topLeftPaddingBox=i>0||a>0?VA(t.left+M,t.top+E,Math.max(0,i-M),Math.max(0,a-E),DA.TOP_LEFT):new oA(t.left+M,t.top+E),this.topRightPaddingBox=s>0||l>0?VA(t.left+Math.min(p,t.width-x),t.top+E,p>t.width+x?0:Math.max(0,s-x),Math.max(0,l-E),DA.TOP_RIGHT):new oA(t.left+t.width-x,t.top+E),this.bottomRightPaddingBox=u>0||h>0?VA(t.left+Math.min(T,t.width-M),t.top+Math.min(B,t.height-I),Math.max(0,u-x),Math.max(0,h-I),DA.BOTTOM_RIGHT):new oA(t.left+t.width-x,t.top+t.height-I),this.bottomLeftPaddingBox=g>0||m>0?VA(t.left+M,t.top+Math.min(S,t.height-I),Math.max(0,g-M),Math.max(0,m-I),DA.BOTTOM_LEFT):new oA(t.left+M,t.top+t.height-I),this.topLeftContentBox=i>0||a>0?VA(t.left+M+H,t.top+E+L,Math.max(0,i-(M+H)),Math.max(0,a-(E+L)),DA.TOP_LEFT):new oA(t.left+M+H,t.top+E+L),this.topRightContentBox=s>0||l>0?VA(t.left+Math.min(p,t.width+M+H),t.top+E+L,p>t.width+M+H?0:s-M+H,l-(E+L),DA.TOP_RIGHT):new oA(t.left+t.width-(x+j),t.top+E+L),this.bottomRightContentBox=u>0||h>0?VA(t.left+Math.min(T,t.width-(M+H)),t.top+Math.min(B,t.height+E+L),Math.max(0,u-(x+j)),h-(I+y),DA.BOTTOM_RIGHT):new oA(t.left+t.width-(x+j),t.top+t.height-(I+y)),this.bottomLeftContentBox=g>0||m>0?VA(t.left+M+H,t.top+S,Math.max(0,g-(M+H)),m-(I+y),DA.BOTTOM_LEFT):new oA(t.left+M+H,t.top+t.height-(I+y))}return r})(),DA;(function(r){r[r.TOP_LEFT=0]="TOP_LEFT",r[r.TOP_RIGHT=1]="TOP_RIGHT",r[r.BOTTOM_RIGHT=2]="BOTTOM_RIGHT",r[r.BOTTOM_LEFT=3]="BOTTOM_LEFT"})(DA||(DA={}));var VA=function(r,A,e,t,n){var i=4*((Math.sqrt(2)-1)/3),a=e*i,o=t*i,s=r+e,l=A+t;switch(n){case DA.TOP_LEFT:return new qn(new oA(r,l),new oA(r,l-o),new oA(s-a,A),new oA(s,A));case DA.TOP_RIGHT:return new qn(new oA(r,A),new oA(r+a,A),new oA(s,l-o),new oA(s,l));case DA.BOTTOM_RIGHT:return new qn(new oA(s,A),new oA(s,A+o),new oA(r+a,l),new oA(r,l));case DA.BOTTOM_LEFT:default:return new qn(new oA(s,l),new oA(s-a,l),new oA(r,A+o),new oA(r,A))}},gi=function(r){return[r.topLeftBorderBox,r.topRightBorderBox,r.bottomRightBorderBox,r.bottomLeftBorderBox]},fB=function(r){return[r.topLeftContentBox,r.topRightContentBox,r.bottomRightContentBox,r.bottomLeftContentBox]},mi=function(r){return[r.topLeftPaddingBox,r.topRightPaddingBox,r.bottomRightPaddingBox,r.bottomLeftPaddingBox]},pB=(function(){function r(A,e,t){this.offsetX=A,this.offsetY=e,this.matrix=t,this.type=0,this.target=6}return r})(),jn=(function(){function r(A,e){this.path=A,this.target=e,this.type=1}return r})(),gB=(function(){function r(A){this.opacity=A,this.type=2,this.target=6}return r})(),mB=function(r){return r.type===0},zc=function(r){return r.type===1},BB=function(r){return r.type===2},Cl=function(r,A){return r.length===A.length?r.some(function(e,t){return e===A[t]}):!1},vB=function(r,A,e,t,n){return r.map(function(i,a){switch(a){case 0:return i.add(A,e);case 1:return i.add(A+t,e);case 2:return i.add(A+t,e+n);case 3:return i.add(A,e+n)}return i})},Wc=(function(){function r(A){this.element=A,this.inlineLevel=[],this.nonInlineLevel=[],this.negativeZIndex=[],this.zeroOrAutoZIndexOrTransformedOrOpacity=[],this.positiveZIndex=[],this.nonPositionedFloats=[],this.nonPositionedInlineLevel=[]}return r})(),Xc=(function(){function r(A,e){if(this.container=A,this.parent=e,this.effects=[],this.curves=new dB(this.container),this.container.styles.opacity<1&&this.effects.push(new gB(this.container.styles.opacity)),this.container.styles.transform!==null){var t=this.container.bounds.left+this.container.styles.transformOrigin[0].number,n=this.container.bounds.top+this.container.styles.transformOrigin[1].number,i=this.container.styles.transform;this.effects.push(new pB(t,n,i))}if(this.container.styles.overflowX!==0){var a=gi(this.curves),o=mi(this.curves);Cl(a,o)?this.effects.push(new jn(a,6)):(this.effects.push(new jn(a,2)),this.effects.push(new jn(o,4)))}}return r.prototype.getEffects=function(A){for(var e=[2,3].indexOf(this.container.styles.position)===-1,t=this.parent,n=this.effects.slice(0);t;){var i=t.effects.filter(function(s){return!zc(s)});if(e||t.container.styles.position!==0||!t.parent){if(n.unshift.apply(n,i),e=[2,3].indexOf(t.container.styles.position)===-1,t.container.styles.overflowX!==0){var a=gi(t.curves),o=mi(t.curves);Cl(a,o)||n.unshift(new jn(o,6))}}else n.unshift.apply(n,i);t=t.parent}return n.filter(function(s){return jA(s.target,A)})},r})(),is=function(r,A,e,t){r.container.elements.forEach(function(n){var i=jA(n.flags,4),a=jA(n.flags,2),o=new Xc(n,r);jA(n.styles.display,2048)&&t.push(o);var s=jA(n.flags,8)?[]:t;if(i||a){var l=i||n.styles.isPositioned()?e:A,c=new Wc(o);if(n.styles.isPositioned()||n.styles.opacity<1||n.styles.isTransformed()){var u=n.styles.zIndex.order;if(u<0){var h=0;l.negativeZIndex.some(function(g,m){return u>g.element.container.styles.zIndex.order?(h=m,!1):h>0}),l.negativeZIndex.splice(h,0,c)}else if(u>0){var d=0;l.positiveZIndex.some(function(g,m){return u>=g.element.container.styles.zIndex.order?(d=m+1,!1):d>0}),l.positiveZIndex.splice(d,0,c)}else l.zeroOrAutoZIndexOrTransformedOrOpacity.push(c)}else n.styles.isFloating()?l.nonPositionedFloats.push(c):l.nonPositionedInlineLevel.push(c);is(o,c,i?c:e,s)}else n.styles.isInlineLevel()?A.inlineLevel.push(o):A.nonInlineLevel.push(o),is(o,A,e,s);jA(n.flags,8)&&Yc(n,s)})},Yc=function(r,A){for(var e=r instanceof As?r.start:1,t=r instanceof As?r.reversed:!1,n=0;n<A.length;n++){var i=A[n];i.container instanceof Qc&&typeof i.container.value=="number"&&i.container.value!==0&&(e=i.container.value),i.listValue=Zr(e,i.container.styles.listStyleType,!0),e+=t?-1:1}},wB=function(r){var A=new Xc(r,null),e=new Wc(A),t=[];return is(A,e,e,t),Yc(A.container,t),e},El=function(r,A){switch(A){case 0:return Le(r.topLeftBorderBox,r.topLeftPaddingBox,r.topRightBorderBox,r.topRightPaddingBox);case 1:return Le(r.topRightBorderBox,r.topRightPaddingBox,r.bottomRightBorderBox,r.bottomRightPaddingBox);case 2:return Le(r.bottomRightBorderBox,r.bottomRightPaddingBox,r.bottomLeftBorderBox,r.bottomLeftPaddingBox);default:return Le(r.bottomLeftBorderBox,r.bottomLeftPaddingBox,r.topLeftBorderBox,r.topLeftPaddingBox)}},_B=function(r,A){switch(A){case 0:return Le(r.topLeftBorderBox,r.topLeftBorderDoubleOuterBox,r.topRightBorderBox,r.topRightBorderDoubleOuterBox);case 1:return Le(r.topRightBorderBox,r.topRightBorderDoubleOuterBox,r.bottomRightBorderBox,r.bottomRightBorderDoubleOuterBox);case 2:return Le(r.bottomRightBorderBox,r.bottomRightBorderDoubleOuterBox,r.bottomLeftBorderBox,r.bottomLeftBorderDoubleOuterBox);default:return Le(r.bottomLeftBorderBox,r.bottomLeftBorderDoubleOuterBox,r.topLeftBorderBox,r.topLeftBorderDoubleOuterBox)}},CB=function(r,A){switch(A){case 0:return Le(r.topLeftBorderDoubleInnerBox,r.topLeftPaddingBox,r.topRightBorderDoubleInnerBox,r.topRightPaddingBox);case 1:return Le(r.topRightBorderDoubleInnerBox,r.topRightPaddingBox,r.bottomRightBorderDoubleInnerBox,r.bottomRightPaddingBox);case 2:return Le(r.bottomRightBorderDoubleInnerBox,r.bottomRightPaddingBox,r.bottomLeftBorderDoubleInnerBox,r.bottomLeftPaddingBox);default:return Le(r.bottomLeftBorderDoubleInnerBox,r.bottomLeftPaddingBox,r.topLeftBorderDoubleInnerBox,r.topLeftPaddingBox)}},EB=function(r,A){switch(A){case 0:return $n(r.topLeftBorderStroke,r.topRightBorderStroke);case 1:return $n(r.topRightBorderStroke,r.bottomRightBorderStroke);case 2:return $n(r.bottomRightBorderStroke,r.bottomLeftBorderStroke);default:return $n(r.bottomLeftBorderStroke,r.topLeftBorderStroke)}},$n=function(r,A){var e=[];return Qe(r)?e.push(r.subdivide(.5,!1)):e.push(r),Qe(A)?e.push(A.subdivide(.5,!0)):e.push(A),e},Le=function(r,A,e,t){var n=[];return Qe(r)?n.push(r.subdivide(.5,!1)):n.push(r),Qe(e)?n.push(e.subdivide(.5,!0)):n.push(e),Qe(t)?n.push(t.subdivide(.5,!0).reverse()):n.push(t),Qe(A)?n.push(A.subdivide(.5,!1).reverse()):n.push(A),n},Jc=function(r){var A=r.bounds,e=r.styles;return A.add(e.borderLeftWidth,e.borderTopWidth,-(e.borderRightWidth+e.borderLeftWidth),-(e.borderTopWidth+e.borderBottomWidth))},Bi=function(r){var A=r.styles,e=r.bounds,t=NA(A.paddingLeft,e.width),n=NA(A.paddingRight,e.width),i=NA(A.paddingTop,e.width),a=NA(A.paddingBottom,e.width);return e.add(t+A.borderLeftWidth,i+A.borderTopWidth,-(A.borderRightWidth+A.borderLeftWidth+t+n),-(A.borderTopWidth+A.borderBottomWidth+i+a))},UB=function(r,A){return r===0?A.bounds:r===2?Bi(A):Jc(A)},xB=function(r,A){return r===0?A.bounds:r===2?Bi(A):Jc(A)},Ia=function(r,A,e){var t=UB(hr(r.styles.backgroundOrigin,A),r),n=xB(hr(r.styles.backgroundClip,A),r),i=yB(hr(r.styles.backgroundSize,A),e,t),a=i[0],o=i[1],s=Or(hr(r.styles.backgroundPosition,A),t.width-a,t.height-o),l=MB(hr(r.styles.backgroundRepeat,A),s,i,t,n),c=Math.round(t.left+s[0]),u=Math.round(t.top+s[1]);return[l,c,u,a,o]},cr=function(r){return OA(r)&&r.value===pr.AUTO},Ai=function(r){return typeof r=="number"},yB=function(r,A,e){var t=A[0],n=A[1],i=A[2],a=r[0],o=r[1];if(!a)return[0,0];if(JA(a)&&o&&JA(o))return[NA(a,e.width),NA(o,e.height)];var s=Ai(i);if(OA(a)&&(a.value===pr.CONTAIN||a.value===pr.COVER)){if(Ai(i)){var l=e.width/e.height;return l<i!=(a.value===pr.COVER)?[e.width,e.width/i]:[e.height*i,e.height]}return[e.width,e.height]}var c=Ai(t),u=Ai(n),h=c||u;if(cr(a)&&(!o||cr(o))){if(c&&u)return[t,n];if(!s&&!h)return[e.width,e.height];if(h&&s){var d=c?t:n*i,g=u?n:t/i;return[d,g]}var m=c?t:e.width,f=u?n:e.height;return[m,f]}if(s){var v=0,p=0;return JA(a)?v=NA(a,e.width):JA(o)&&(p=NA(o,e.height)),cr(a)?v=p*i:(!o||cr(o))&&(p=v/i),[v,p]}var B=null,T=null;if(JA(a)?B=NA(a,e.width):o&&JA(o)&&(T=NA(o,e.height)),B!==null&&(!o||cr(o))&&(T=c&&u?B/t*n:e.height),T!==null&&cr(a)&&(B=c&&u?T/n*t:e.width),B!==null&&T!==null)return[B,T];throw new Error("Unable to calculate background-size for element")},hr=function(r,A){var e=r[A];return typeof e>"u"?r[0]:e},MB=function(r,A,e,t,n){var i=A[0],a=A[1],o=e[0],s=e[1];switch(r){case 2:return[new oA(Math.round(t.left),Math.round(t.top+a)),new oA(Math.round(t.left+t.width),Math.round(t.top+a)),new oA(Math.round(t.left+t.width),Math.round(s+t.top+a)),new oA(Math.round(t.left),Math.round(s+t.top+a))];case 3:return[new oA(Math.round(t.left+i),Math.round(t.top)),new oA(Math.round(t.left+i+o),Math.round(t.top)),new oA(Math.round(t.left+i+o),Math.round(t.height+t.top)),new oA(Math.round(t.left+i),Math.round(t.height+t.top))];case 1:return[new oA(Math.round(t.left+i),Math.round(t.top+a)),new oA(Math.round(t.left+i+o),Math.round(t.top+a)),new oA(Math.round(t.left+i+o),Math.round(t.top+a+s)),new oA(Math.round(t.left+i),Math.round(t.top+a+s))];default:return[new oA(Math.round(n.left),Math.round(n.top)),new oA(Math.round(n.left+n.width),Math.round(n.top)),new oA(Math.round(n.left+n.width),Math.round(n.height+n.top)),new oA(Math.round(n.left),Math.round(n.height+n.top))]}},SB="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",Ul="Hidden Text",FB=(function(){function r(A){this._data={},this._document=A}return r.prototype.parseMetrics=function(A,e){var t=this._document.createElement("div"),n=this._document.createElement("img"),i=this._document.createElement("span"),a=this._document.body;t.style.visibility="hidden",t.style.fontFamily=A,t.style.fontSize=e,t.style.margin="0",t.style.padding="0",t.style.whiteSpace="nowrap",a.appendChild(t),n.src=SB,n.width=1,n.height=1,n.style.margin="0",n.style.padding="0",n.style.verticalAlign="baseline",i.style.fontFamily=A,i.style.fontSize=e,i.style.margin="0",i.style.padding="0",i.appendChild(this._document.createTextNode(Ul)),t.appendChild(i),t.appendChild(n);var o=n.offsetTop-i.offsetTop+2;t.removeChild(i),t.appendChild(this._document.createTextNode(Ul)),t.style.lineHeight="normal",n.style.verticalAlign="super";var s=n.offsetTop-t.offsetTop+2;return a.removeChild(t),{baseline:o,middle:s}},r.prototype.getMetrics=function(A,e){var t=A+" "+e;return typeof this._data[t]>"u"&&(this._data[t]=this.parseMetrics(A,e)),this._data[t]},r})(),Zc=(function(){function r(A,e){this.context=A,this.options=e}return r})(),TB=1e4,QB=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this;return n._activeEffects=[],n.canvas=t.canvas?t.canvas:document.createElement("canvas"),n.ctx=n.canvas.getContext("2d"),t.canvas||(n.canvas.width=Math.floor(t.width*t.scale),n.canvas.height=Math.floor(t.height*t.scale),n.canvas.style.width=t.width+"px",n.canvas.style.height=t.height+"px"),n.fontMetrics=new FB(document),n.ctx.scale(n.options.scale,n.options.scale),n.ctx.translate(-t.x,-t.y),n.ctx.textBaseline="bottom",n._activeEffects=[],n.context.logger.debug("Canvas renderer initialized ("+t.width+"x"+t.height+") with scale "+t.scale),n}return A.prototype.applyEffects=function(e){for(var t=this;this._activeEffects.length;)this.popEffect();e.forEach(function(n){return t.applyEffect(n)})},A.prototype.applyEffect=function(e){this.ctx.save(),BB(e)&&(this.ctx.globalAlpha=e.opacity),mB(e)&&(this.ctx.translate(e.offsetX,e.offsetY),this.ctx.transform(e.matrix[0],e.matrix[1],e.matrix[2],e.matrix[3],e.matrix[4],e.matrix[5]),this.ctx.translate(-e.offsetX,-e.offsetY)),zc(e)&&(this.path(e.path),this.ctx.clip()),this._activeEffects.push(e)},A.prototype.popEffect=function(){this._activeEffects.pop(),this.ctx.restore()},A.prototype.renderStack=function(e){return fe(this,void 0,void 0,function(){var t;return le(this,function(n){switch(n.label){case 0:return t=e.element.container.styles,t.isVisible()?[4,this.renderStackContent(e)]:[3,2];case 1:n.sent(),n.label=2;case 2:return[2]}})})},A.prototype.renderNode=function(e){return fe(this,void 0,void 0,function(){return le(this,function(t){switch(t.label){case 0:if(jA(e.container.flags,16))debugger;return e.container.styles.isVisible()?[4,this.renderNodeBackgroundAndBorders(e)]:[3,3];case 1:return t.sent(),[4,this.renderNodeContent(e)];case 2:t.sent(),t.label=3;case 3:return[2]}})})},A.prototype.renderTextWithLetterSpacing=function(e,t,n){var i=this;if(t===0)this.ctx.fillText(e.text,e.bounds.left,e.bounds.top+n);else{var a=fs(e.text);a.reduce(function(o,s){return i.ctx.fillText(s,o,e.bounds.top+n),o+i.ctx.measureText(s).width},e.bounds.left)}},A.prototype.createFontStyle=function(e){var t=e.fontVariant.filter(function(a){return a==="normal"||a==="small-caps"}).join(""),n=HB(e.fontFamily).join(", "),i=tn(e.fontSize)?""+e.fontSize.number+e.fontSize.unit:e.fontSize.number+"px";return[[e.fontStyle,t,e.fontWeight,i,n].join(" "),n,i]},A.prototype.renderTextNode=function(e,t){return fe(this,void 0,void 0,function(){var n,i,a,o,s,l,c,u,h=this;return le(this,function(d){return n=this.createFontStyle(t),i=n[0],a=n[1],o=n[2],this.ctx.font=i,this.ctx.direction=t.direction===1?"rtl":"ltr",this.ctx.textAlign="left",this.ctx.textBaseline="alphabetic",s=this.fontMetrics.getMetrics(a,o),l=s.baseline,c=s.middle,u=t.paintOrder,e.textBounds.forEach(function(g){u.forEach(function(m){switch(m){case 0:h.ctx.fillStyle=te(t.color),h.renderTextWithLetterSpacing(g,t.letterSpacing,l);var f=t.textShadow;f.length&&g.text.trim().length&&(f.slice(0).reverse().forEach(function(v){h.ctx.shadowColor=te(v.color),h.ctx.shadowOffsetX=v.offsetX.number*h.options.scale,h.ctx.shadowOffsetY=v.offsetY.number*h.options.scale,h.ctx.shadowBlur=v.blur.number,h.renderTextWithLetterSpacing(g,t.letterSpacing,l)}),h.ctx.shadowColor="",h.ctx.shadowOffsetX=0,h.ctx.shadowOffsetY=0,h.ctx.shadowBlur=0),t.textDecorationLine.length&&(h.ctx.fillStyle=te(t.textDecorationColor||t.color),t.textDecorationLine.forEach(function(v){switch(v){case 1:h.ctx.fillRect(g.bounds.left,Math.round(g.bounds.top+l),g.bounds.width,1);break;case 2:h.ctx.fillRect(g.bounds.left,Math.round(g.bounds.top),g.bounds.width,1);break;case 3:h.ctx.fillRect(g.bounds.left,Math.ceil(g.bounds.top+c),g.bounds.width,1);break}}));break;case 1:t.webkitTextStrokeWidth&&g.text.trim().length&&(h.ctx.strokeStyle=te(t.webkitTextStrokeColor),h.ctx.lineWidth=t.webkitTextStrokeWidth,h.ctx.lineJoin=window.chrome?"miter":"round",h.ctx.strokeText(g.text,g.bounds.left,g.bounds.top+l)),h.ctx.strokeStyle="",h.ctx.lineWidth=0,h.ctx.lineJoin="miter";break}})}),[2]})})},A.prototype.renderReplacedElement=function(e,t,n){if(n&&e.intrinsicWidth>0&&e.intrinsicHeight>0){var i=Bi(e),a=mi(t);this.path(a),this.ctx.save(),this.ctx.clip(),this.ctx.drawImage(n,0,0,e.intrinsicWidth,e.intrinsicHeight,i.left,i.top,i.width,i.height),this.ctx.restore()}},A.prototype.renderNodeContent=function(e){return fe(this,void 0,void 0,function(){var t,n,i,a,o,s,p,p,l,c,u,h,T,d,g,S,m,f,v,p,B,T,S;return le(this,function(E){switch(E.label){case 0:this.applyEffects(e.getEffects(4)),t=e.container,n=e.curves,i=t.styles,a=0,o=t.textNodes,E.label=1;case 1:return a<o.length?(s=o[a],[4,this.renderTextNode(s,i)]):[3,4];case 2:E.sent(),E.label=3;case 3:return a++,[3,1];case 4:if(!(t instanceof Sc))return[3,8];E.label=5;case 5:return E.trys.push([5,7,,8]),[4,this.context.cache.match(t.src)];case 6:return p=E.sent(),this.renderReplacedElement(t,n,p),[3,8];case 7:return E.sent(),this.context.logger.error("Error loading image "+t.src),[3,8];case 8:if(t instanceof Fc&&this.renderReplacedElement(t,n,t.canvas),!(t instanceof Tc))return[3,12];E.label=9;case 9:return E.trys.push([9,11,,12]),[4,this.context.cache.match(t.svg)];case 10:return p=E.sent(),this.renderReplacedElement(t,n,p),[3,12];case 11:return E.sent(),this.context.logger.error("Error loading svg "+t.svg.substring(0,255)),[3,12];case 12:return t instanceof Lc&&t.tree?(l=new A(this.context,{scale:this.options.scale,backgroundColor:t.backgroundColor,x:0,y:0,width:t.width,height:t.height}),[4,l.render(t.tree)]):[3,14];case 13:c=E.sent(),t.width&&t.height&&this.ctx.drawImage(c,0,0,t.width,t.height,t.bounds.left,t.bounds.top,t.bounds.width,t.bounds.height),E.label=14;case 14:if(t instanceof ps&&(u=Math.min(t.bounds.width,t.bounds.height),t.type===hi?t.checked&&(this.ctx.save(),this.path([new oA(t.bounds.left+u*.39363,t.bounds.top+u*.79),new oA(t.bounds.left+u*.16,t.bounds.top+u*.5549),new oA(t.bounds.left+u*.27347,t.bounds.top+u*.44071),new oA(t.bounds.left+u*.39694,t.bounds.top+u*.5649),new oA(t.bounds.left+u*.72983,t.bounds.top+u*.23),new oA(t.bounds.left+u*.84,t.bounds.top+u*.34085),new oA(t.bounds.left+u*.39363,t.bounds.top+u*.79)]),this.ctx.fillStyle=te(ul),this.ctx.fill(),this.ctx.restore()):t.type===di&&t.checked&&(this.ctx.save(),this.ctx.beginPath(),this.ctx.arc(t.bounds.left+u/2,t.bounds.top+u/2,u/4,0,Math.PI*2,!0),this.ctx.fillStyle=te(ul),this.ctx.fill(),this.ctx.restore())),bB(t)&&t.value.length){switch(h=this.createFontStyle(i),T=h[0],d=h[1],g=this.fontMetrics.getMetrics(T,d).baseline,this.ctx.font=T,this.ctx.fillStyle=te(i.color),this.ctx.textBaseline="alphabetic",this.ctx.textAlign=LB(t.styles.textAlign),S=Bi(t),m=0,t.styles.textAlign){case 1:m+=S.width/2;break;case 2:m+=S.width;break}f=S.add(m,0,0,-S.height/2+1),this.ctx.save(),this.path([new oA(S.left,S.top),new oA(S.left+S.width,S.top),new oA(S.left+S.width,S.top+S.height),new oA(S.left,S.top+S.height)]),this.ctx.clip(),this.renderTextWithLetterSpacing(new Wr(t.value,f),i.letterSpacing,g),this.ctx.restore(),this.ctx.textBaseline="alphabetic",this.ctx.textAlign="left"}if(!jA(t.styles.display,2048))return[3,20];if(t.styles.listStyleImage===null)return[3,19];if(v=t.styles.listStyleImage,v.type!==0)return[3,18];p=void 0,B=v.url,E.label=15;case 15:return E.trys.push([15,17,,18]),[4,this.context.cache.match(B)];case 16:return p=E.sent(),this.ctx.drawImage(p,t.bounds.left-(p.width+10),t.bounds.top),[3,18];case 17:return E.sent(),this.context.logger.error("Error loading list-style-image "+B),[3,18];case 18:return[3,20];case 19:e.listValue&&t.styles.listStyleType!==-1&&(T=this.createFontStyle(i)[0],this.ctx.font=T,this.ctx.fillStyle=te(i.color),this.ctx.textBaseline="middle",this.ctx.textAlign="right",S=new at(t.bounds.left,t.bounds.top+NA(t.styles.paddingTop,t.bounds.width),t.bounds.width,Yo(i.lineHeight,i.fontSize.number)/2+1),this.renderTextWithLetterSpacing(new Wr(e.listValue,S),i.letterSpacing,Yo(i.lineHeight,i.fontSize.number)/2+2),this.ctx.textBaseline="bottom",this.ctx.textAlign="left"),E.label=20;case 20:return[2]}})})},A.prototype.renderStackContent=function(e){return fe(this,void 0,void 0,function(){var t,n,v,i,a,v,o,s,v,l,c,v,u,h,v,d,g,v,m,f,v;return le(this,function(p){switch(p.label){case 0:if(jA(e.element.container.flags,16))debugger;return[4,this.renderNodeBackgroundAndBorders(e.element)];case 1:p.sent(),t=0,n=e.negativeZIndex,p.label=2;case 2:return t<n.length?(v=n[t],[4,this.renderStack(v)]):[3,5];case 3:p.sent(),p.label=4;case 4:return t++,[3,2];case 5:return[4,this.renderNodeContent(e.element)];case 6:p.sent(),i=0,a=e.nonInlineLevel,p.label=7;case 7:return i<a.length?(v=a[i],[4,this.renderNode(v)]):[3,10];case 8:p.sent(),p.label=9;case 9:return i++,[3,7];case 10:o=0,s=e.nonPositionedFloats,p.label=11;case 11:return o<s.length?(v=s[o],[4,this.renderStack(v)]):[3,14];case 12:p.sent(),p.label=13;case 13:return o++,[3,11];case 14:l=0,c=e.nonPositionedInlineLevel,p.label=15;case 15:return l<c.length?(v=c[l],[4,this.renderStack(v)]):[3,18];case 16:p.sent(),p.label=17;case 17:return l++,[3,15];case 18:u=0,h=e.inlineLevel,p.label=19;case 19:return u<h.length?(v=h[u],[4,this.renderNode(v)]):[3,22];case 20:p.sent(),p.label=21;case 21:return u++,[3,19];case 22:d=0,g=e.zeroOrAutoZIndexOrTransformedOrOpacity,p.label=23;case 23:return d<g.length?(v=g[d],[4,this.renderStack(v)]):[3,26];case 24:p.sent(),p.label=25;case 25:return d++,[3,23];case 26:m=0,f=e.positiveZIndex,p.label=27;case 27:return m<f.length?(v=f[m],[4,this.renderStack(v)]):[3,30];case 28:p.sent(),p.label=29;case 29:return m++,[3,27];case 30:return[2]}})})},A.prototype.mask=function(e){this.ctx.beginPath(),this.ctx.moveTo(0,0),this.ctx.lineTo(this.canvas.width,0),this.ctx.lineTo(this.canvas.width,this.canvas.height),this.ctx.lineTo(0,this.canvas.height),this.ctx.lineTo(0,0),this.formatPath(e.slice(0).reverse()),this.ctx.closePath()},A.prototype.path=function(e){this.ctx.beginPath(),this.formatPath(e),this.ctx.closePath()},A.prototype.formatPath=function(e){var t=this;e.forEach(function(n,i){var a=Qe(n)?n.start:n;i===0?t.ctx.moveTo(a.x,a.y):t.ctx.lineTo(a.x,a.y),Qe(n)&&t.ctx.bezierCurveTo(n.startControl.x,n.startControl.y,n.endControl.x,n.endControl.y,n.end.x,n.end.y)})},A.prototype.renderRepeat=function(e,t,n,i){this.path(e),this.ctx.fillStyle=t,this.ctx.translate(n,i),this.ctx.fill(),this.ctx.translate(-n,-i)},A.prototype.resizeImage=function(e,t,n){var i;if(e.width===t&&e.height===n)return e;var a=(i=this.canvas.ownerDocument)!==null&&i!==void 0?i:document,o=a.createElement("canvas");o.width=Math.max(1,t),o.height=Math.max(1,n);var s=o.getContext("2d");return s.drawImage(e,0,0,e.width,e.height,0,0,t,n),o},A.prototype.renderBackgroundImage=function(e){return fe(this,void 0,void 0,function(){var t,n,i,a,o,s;return le(this,function(l){switch(l.label){case 0:t=e.styles.backgroundImage.length-1,n=function(c){var u,h,d,L,iA,k,H,D,I,g,L,iA,k,H,D,m,f,v,p,B,T,S,E,x,I,M,L,j,y,H,D,AA,iA,k,G,W,R,V,rA,w,_,b;return le(this,function(O){switch(O.label){case 0:if(c.type!==0)return[3,5];u=void 0,h=c.url,O.label=1;case 1:return O.trys.push([1,3,,4]),[4,i.context.cache.match(h)];case 2:return u=O.sent(),[3,4];case 3:return O.sent(),i.context.logger.error("Error loading background-image "+h),[3,4];case 4:return u&&(d=Ia(e,t,[u.width,u.height,u.width/u.height]),L=d[0],iA=d[1],k=d[2],H=d[3],D=d[4],I=i.ctx.createPattern(i.resizeImage(u,H,D),"repeat"),i.renderRepeat(L,I,iA,k)),[3,6];case 5:mp(c)?(g=Ia(e,t,[null,null,null]),L=g[0],iA=g[1],k=g[2],H=g[3],D=g[4],m=hp(c.angle,H,D),f=m[0],v=m[1],p=m[2],B=m[3],T=m[4],S=document.createElement("canvas"),S.width=H,S.height=D,E=S.getContext("2d"),x=E.createLinearGradient(v,B,p,T),Wo(c.stops,f).forEach(function(F){return x.addColorStop(F.stop,te(F.color))}),E.fillStyle=x,E.fillRect(0,0,H,D),H>0&&D>0&&(I=i.ctx.createPattern(S,"repeat"),i.renderRepeat(L,I,iA,k))):Bp(c)&&(M=Ia(e,t,[null,null,null]),L=M[0],j=M[1],y=M[2],H=M[3],D=M[4],AA=c.position.length===0?[us]:c.position,iA=NA(AA[0],H),k=NA(AA[AA.length-1],D),G=dp(c,iA,k,H,D),W=G[0],R=G[1],W>0&&R>0&&(V=i.ctx.createRadialGradient(j+iA,y+k,0,j+iA,y+k,W),Wo(c.stops,W*2).forEach(function(F){return V.addColorStop(F.stop,te(F.color))}),i.path(L),i.ctx.fillStyle=V,W!==R?(rA=e.bounds.left+.5*e.bounds.width,w=e.bounds.top+.5*e.bounds.height,_=R/W,b=1/_,i.ctx.save(),i.ctx.translate(rA,w),i.ctx.transform(1,0,0,_,0,0),i.ctx.translate(-rA,-w),i.ctx.fillRect(j,b*(y-w)+w,H,D*b),i.ctx.restore()):i.ctx.fill())),O.label=6;case 6:return t--,[2]}})},i=this,a=0,o=e.styles.backgroundImage.slice(0).reverse(),l.label=1;case 1:return a<o.length?(s=o[a],[5,n(s)]):[3,4];case 2:l.sent(),l.label=3;case 3:return a++,[3,1];case 4:return[2]}})})},A.prototype.renderSolidBorder=function(e,t,n){return fe(this,void 0,void 0,function(){return le(this,function(i){return this.path(El(n,t)),this.ctx.fillStyle=te(e),this.ctx.fill(),[2]})})},A.prototype.renderDoubleBorder=function(e,t,n,i){return fe(this,void 0,void 0,function(){var a,o;return le(this,function(s){switch(s.label){case 0:return t<3?[4,this.renderSolidBorder(e,n,i)]:[3,2];case 1:return s.sent(),[2];case 2:return a=_B(i,n),this.path(a),this.ctx.fillStyle=te(e),this.ctx.fill(),o=CB(i,n),this.path(o),this.ctx.fill(),[2]}})})},A.prototype.renderNodeBackgroundAndBorders=function(e){return fe(this,void 0,void 0,function(){var t,n,i,a,o,s,l,c,u=this;return le(this,function(h){switch(h.label){case 0:return this.applyEffects(e.getEffects(2)),t=e.container.styles,n=!vt(t.backgroundColor)||t.backgroundImage.length,i=[{style:t.borderTopStyle,color:t.borderTopColor,width:t.borderTopWidth},{style:t.borderRightStyle,color:t.borderRightColor,width:t.borderRightWidth},{style:t.borderBottomStyle,color:t.borderBottomColor,width:t.borderBottomWidth},{style:t.borderLeftStyle,color:t.borderLeftColor,width:t.borderLeftWidth}],a=IB(hr(t.backgroundClip,0),e.curves),n||t.boxShadow.length?(this.ctx.save(),this.path(a),this.ctx.clip(),vt(t.backgroundColor)||(this.ctx.fillStyle=te(t.backgroundColor),this.ctx.fill()),[4,this.renderBackgroundImage(e.container)]):[3,2];case 1:h.sent(),this.ctx.restore(),t.boxShadow.slice(0).reverse().forEach(function(d){u.ctx.save();var g=gi(e.curves),m=d.inset?0:TB,f=vB(g,-m+(d.inset?1:-1)*d.spread.number,(d.inset?1:-1)*d.spread.number,d.spread.number*(d.inset?-2:2),d.spread.number*(d.inset?-2:2));d.inset?(u.path(g),u.ctx.clip(),u.mask(f)):(u.mask(g),u.ctx.clip(),u.path(f)),u.ctx.shadowOffsetX=d.offsetX.number+m,u.ctx.shadowOffsetY=d.offsetY.number,u.ctx.shadowColor=te(d.color),u.ctx.shadowBlur=d.blur.number,u.ctx.fillStyle=d.inset?te(d.color):"rgba(0,0,0,1)",u.ctx.fill(),u.ctx.restore()}),h.label=2;case 2:o=0,s=0,l=i,h.label=3;case 3:return s<l.length?(c=l[s],c.style!==0&&!vt(c.color)&&c.width>0?c.style!==2?[3,5]:[4,this.renderDashedDottedBorder(c.color,c.width,o,e.curves,2)]:[3,11]):[3,13];case 4:return h.sent(),[3,11];case 5:return c.style!==3?[3,7]:[4,this.renderDashedDottedBorder(c.color,c.width,o,e.curves,3)];case 6:return h.sent(),[3,11];case 7:return c.style!==4?[3,9]:[4,this.renderDoubleBorder(c.color,c.width,o,e.curves)];case 8:return h.sent(),[3,11];case 9:return[4,this.renderSolidBorder(c.color,o,e.curves)];case 10:h.sent(),h.label=11;case 11:o++,h.label=12;case 12:return s++,[3,3];case 13:return[2]}})})},A.prototype.renderDashedDottedBorder=function(e,t,n,i,a){return fe(this,void 0,void 0,function(){var o,s,l,c,u,h,d,g,m,f,v,p,B,T,S,E,S,E;return le(this,function(x){return this.ctx.save(),o=EB(i,n),s=El(i,n),a===2&&(this.path(s),this.ctx.clip()),Qe(s[0])?(l=s[0].start.x,c=s[0].start.y):(l=s[0].x,c=s[0].y),Qe(s[1])?(u=s[1].end.x,h=s[1].end.y):(u=s[1].x,h=s[1].y),n===0||n===2?d=Math.abs(l-u):d=Math.abs(c-h),this.ctx.beginPath(),a===3?this.formatPath(o):this.formatPath(s.slice(0,2)),g=t<3?t*3:t*2,m=t<3?t*2:t,a===3&&(g=t,m=t),f=!0,d<=g*2?f=!1:d<=g*2+m?(v=d/(2*g+m),g*=v,m*=v):(p=Math.floor((d+m)/(g+m)),B=(d-p*g)/(p-1),T=(d-(p+1)*g)/p,m=T<=0||Math.abs(m-B)<Math.abs(m-T)?B:T),f&&(a===3?this.ctx.setLineDash([0,g+m]):this.ctx.setLineDash([g,m])),a===3?(this.ctx.lineCap="round",this.ctx.lineWidth=t):this.ctx.lineWidth=t*2+1.1,this.ctx.strokeStyle=te(e),this.ctx.stroke(),this.ctx.setLineDash([]),a===2&&(Qe(s[0])&&(S=s[3],E=s[0],this.ctx.beginPath(),this.formatPath([new oA(S.end.x,S.end.y),new oA(E.start.x,E.start.y)]),this.ctx.stroke()),Qe(s[1])&&(S=s[1],E=s[2],this.ctx.beginPath(),this.formatPath([new oA(S.end.x,S.end.y),new oA(E.start.x,E.start.y)]),this.ctx.stroke())),this.ctx.restore(),[2]})})},A.prototype.render=function(e){return fe(this,void 0,void 0,function(){var t;return le(this,function(n){switch(n.label){case 0:return this.options.backgroundColor&&(this.ctx.fillStyle=te(this.options.backgroundColor),this.ctx.fillRect(this.options.x,this.options.y,this.options.width,this.options.height)),t=wB(e),[4,this.renderStack(t)];case 1:return n.sent(),this.applyEffects([]),[2,this.canvas]}})})},A})(Zc),bB=function(r){return r instanceof Ic||r instanceof bc?!0:r instanceof ps&&r.type!==di&&r.type!==hi},IB=function(r,A){switch(r){case 0:return gi(A);case 2:return fB(A);default:return mi(A)}},LB=function(r){switch(r){case 1:return"center";case 2:return"right";default:return"left"}},RB=["-apple-system","system-ui"],HB=function(r){return/iPhone OS 15_(0|1)/.test(window.navigator.userAgent)?r.filter(function(A){return RB.indexOf(A)===-1}):r},DB=(function(r){Ke(A,r);function A(e,t){var n=r.call(this,e,t)||this;return n.canvas=t.canvas?t.canvas:document.createElement("canvas"),n.ctx=n.canvas.getContext("2d"),n.options=t,n.canvas.width=Math.floor(t.width*t.scale),n.canvas.height=Math.floor(t.height*t.scale),n.canvas.style.width=t.width+"px",n.canvas.style.height=t.height+"px",n.ctx.scale(n.options.scale,n.options.scale),n.ctx.translate(-t.x,-t.y),n.context.logger.debug("EXPERIMENTAL ForeignObject renderer initialized ("+t.width+"x"+t.height+" at "+t.x+","+t.y+") with scale "+t.scale),n}return A.prototype.render=function(e){return fe(this,void 0,void 0,function(){var t,n;return le(this,function(i){switch(i.label){case 0:return t=$a(this.options.width*this.options.scale,this.options.height*this.options.scale,this.options.scale,this.options.scale,e),[4,PB(t)];case 1:return n=i.sent(),this.options.backgroundColor&&(this.ctx.fillStyle=te(this.options.backgroundColor),this.ctx.fillRect(0,0,this.options.width*this.options.scale,this.options.height*this.options.scale)),this.ctx.drawImage(n,-this.options.x*this.options.scale,-this.options.y*this.options.scale),[2,this.canvas]}})})},A})(Zc),PB=function(r){return new Promise(function(A,e){var t=new Image;t.onload=function(){A(t)},t.onerror=e,t.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(new XMLSerializer().serializeToString(r))})},OB=(function(){function r(A){var e=A.id,t=A.enabled;this.id=e,this.enabled=t,this.start=Date.now()}return r.prototype.debug=function(){for(var A=[],e=0;e<arguments.length;e++)A[e]=arguments[e];this.enabled&&(typeof window<"u"&&window.console&&typeof console.debug=="function"?console.debug.apply(console,bn([this.id,this.getTime()+"ms"],A)):this.info.apply(this,A))},r.prototype.getTime=function(){return Date.now()-this.start},r.prototype.info=function(){for(var A=[],e=0;e<arguments.length;e++)A[e]=arguments[e];this.enabled&&typeof window<"u"&&window.console&&typeof console.info=="function"&&console.info.apply(console,bn([this.id,this.getTime()+"ms"],A))},r.prototype.warn=function(){for(var A=[],e=0;e<arguments.length;e++)A[e]=arguments[e];this.enabled&&(typeof window<"u"&&window.console&&typeof console.warn=="function"?console.warn.apply(console,bn([this.id,this.getTime()+"ms"],A)):this.info.apply(this,A))},r.prototype.error=function(){for(var A=[],e=0;e<arguments.length;e++)A[e]=arguments[e];this.enabled&&(typeof window<"u"&&window.console&&typeof console.error=="function"?console.error.apply(console,bn([this.id,this.getTime()+"ms"],A)):this.info.apply(this,A))},r.instances={},r})(),NB=(function(){function r(A,e){var t;this.windowBounds=e,this.instanceName="#"+r.instanceCount++,this.logger=new OB({id:this.instanceName,enabled:A.logging}),this.cache=(t=A.cache)!==null&&t!==void 0?t:new aB(this,A)}return r.instanceCount=1,r})(),GB=function(r,A){return A===void 0&&(A={}),VB(r,A)};typeof window<"u"&&kc.setContext(window);var VB=function(r,A){return fe(void 0,void 0,void 0,function(){var e,t,n,i,a,o,s,l,c,u,h,d,g,m,f,v,p,B,T,S,x,E,x,I,M,L,j,y,H,D,AA,iA,k,G,W,R,V,rA,w,_;return le(this,function(b){switch(b.label){case 0:if(!r||typeof r!="object")return[2,Promise.reject("Invalid element provided as first argument")];if(e=r.ownerDocument,!e)throw new Error("Element is not attached to a Document");if(t=e.defaultView,!t)throw new Error("Document is not attached to a Window");return n={allowTaint:(I=A.allowTaint)!==null&&I!==void 0?I:!1,imageTimeout:(M=A.imageTimeout)!==null&&M!==void 0?M:15e3,proxy:A.proxy,useCORS:(L=A.useCORS)!==null&&L!==void 0?L:!1},i=Pa({logging:(j=A.logging)!==null&&j!==void 0?j:!0,cache:A.cache},n),a={windowWidth:(y=A.windowWidth)!==null&&y!==void 0?y:t.innerWidth,windowHeight:(H=A.windowHeight)!==null&&H!==void 0?H:t.innerHeight,scrollX:(D=A.scrollX)!==null&&D!==void 0?D:t.pageXOffset,scrollY:(AA=A.scrollY)!==null&&AA!==void 0?AA:t.pageYOffset},o=new at(a.scrollX,a.scrollY,a.windowWidth,a.windowHeight),s=new NB(i,o),l=(iA=A.foreignObjectRendering)!==null&&iA!==void 0?iA:!1,c={allowTaint:(k=A.allowTaint)!==null&&k!==void 0?k:!1,onclone:A.onclone,ignoreElements:A.ignoreElements,inlineImages:l,copyStyles:l},s.logger.debug("Starting document clone with size "+o.width+"x"+o.height+" scrolled to "+-o.left+","+-o.top),u=new wl(s,r,c),h=u.clonedReferenceElement,h?[4,u.toIFrame(e,o)]:[2,Promise.reject("Unable to find element in cloned iframe")];case 1:return d=b.sent(),g=gs(h)||Km(h)?Bd(h.ownerDocument):xi(s,h),m=g.width,f=g.height,v=g.left,p=g.top,B=KB(s,h,A.backgroundColor),T={canvas:A.canvas,backgroundColor:B,scale:(W=(G=A.scale)!==null&&G!==void 0?G:t.devicePixelRatio)!==null&&W!==void 0?W:1,x:((R=A.x)!==null&&R!==void 0?R:0)+v,y:((V=A.y)!==null&&V!==void 0?V:0)+p,width:(rA=A.width)!==null&&rA!==void 0?rA:Math.ceil(m),height:(w=A.height)!==null&&w!==void 0?w:Math.ceil(f)},l?(s.logger.debug("Document cloned, using foreign object rendering"),x=new DB(s,T),[4,x.render(h)]):[3,3];case 2:return S=b.sent(),[3,5];case 3:return s.logger.debug("Document cloned, element located at "+v+","+p+" with size "+m+"x"+f+" using computed rendering"),s.logger.debug("Starting DOM parsing"),E=Hc(s,h),B===E.styles.backgroundColor&&(E.styles.backgroundColor=nt.TRANSPARENT),s.logger.debug("Starting renderer for element at "+T.x+","+T.y+" with size "+T.width+"x"+T.height),x=new QB(s,T),[4,x.render(E)];case 4:S=b.sent(),b.label=5;case 5:return(!((_=A.removeContainer)!==null&&_!==void 0)||_)&&(wl.destroy(d)||s.logger.error("Cannot detach cloned iframe as it is not in the DOM anymore")),s.logger.debug("Finished rendering"),[2,S]}})})},KB=function(r,A,e){var t=A.ownerDocument,n=t.documentElement?kr(r,getComputedStyle(t.documentElement).backgroundColor):nt.TRANSPARENT,i=t.body?kr(r,getComputedStyle(t.body).backgroundColor):nt.TRANSPARENT,a=typeof e=="string"?kr(r,e):e===null?nt.TRANSPARENT:4294967295;return A===t.documentElement?vt(n)?vt(i)?a:i:n:a};const ms="#f4edde",kB="60px 52px 40px",zB="36px";let me=null;function WB(r,A){return me||(me=document.createElement("div"),me.style.position="fixed",me.style.top="0",me.style.left="-99999px",me.style.overflow="hidden",me.style.boxSizing="border-box",me.style.background=ms,me.style.padding=kB,me.style.lineHeight=zB,document.body.appendChild(me)),me.style.width=r+"px",me.style.height=A+"px",me}function xl(r,A){const e=document.createElement("canvas");e.width=Math.max(1,Math.round(r)),e.height=Math.max(1,Math.round(A));const t=e.getContext("2d");t.fillStyle=ms,t.fillRect(0,0,e.width,e.height),t.strokeStyle="rgba(44,36,22,0.12)",t.lineWidth=1;for(let n=36;n<e.height;n+=36)t.beginPath(),t.moveTo(0,n+.5),t.lineTo(e.width,n+.5),t.stroke();return e}async function yl(r,A,e){try{return await Promise.race([GB(r,{backgroundColor:ms,useCORS:!0,scale:1,logging:!1,width:Math.round(A),height:Math.round(e)}),new Promise((n,i)=>setTimeout(()=>i(new Error("snapshot timeout")),1800))])}catch{return null}}function XB(r){return r<.5?4*r*r*r:1-Math.pow(-2*r+2,3)/2}function YB(){try{const r=document.createElement("canvas");return!!(window.WebGLRenderingContext&&(r.getContext("webgl2")||r.getContext("webgl")))}catch{return!1}}async function JB({direction:r,bookRect:A,frontEl:e,backHTML:t,backFont:n,backFontSize:i}){const a=Math.max(2,Math.round(A.width)),o=Math.max(1,Math.round(A.height)),s=a/2,l=WB(s,o);l.style.fontFamily=n||"Georgia, serif",l.style.fontSize=i||"18px",l.innerHTML=t||"",await new Promise(W=>requestAnimationFrame(()=>requestAnimationFrame(W)));const[c,u]=await Promise.all([yl(e,s,o),yl(l,s,o)]);l.innerHTML="";const h=c||xl(s,o),d=u||xl(s,o),g=new dd,m=new os(-a/2,a/2,o/2,-o/2,.1,4e3);m.position.z=1200;const f=new zl({antialias:!0,alpha:!0});f.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),f.setSize(a,o),f.outputColorSpace=YA;const v=document.createElement("div");v.style.position="fixed",v.style.left=A.left+"px",v.style.top=A.top+"px",v.style.width=a+"px",v.style.height=o+"px",v.style.zIndex="1000",v.style.pointerEvents="none",v.appendChild(f.domElement),document.body.appendChild(v),g.add(new gd(16774111,.65));const p=new xo(16774886,1);p.position.set(-a*.3,o*.5,900),g.add(p);const B=new xo(14674687,.35);B.position.set(a*.5,-o*.3,600),g.add(B);const T=new _o(h),S=new _o(d);T.colorSpace=YA,S.colorSpace=YA;const E=32,x=new Ei(s,o,E,1),I=x.attributes.position.array.slice(),M=new Co({map:T,side:0,roughness:.92,metalness:.01}),L=new Co({map:S,side:0,roughness:.92,metalness:.01}),y=r==="next"?s/2:-s/2,H=new be(x,M);H.position.x=y;const D=new be(x,L);D.position.x=y,D.rotation.y=Math.PI;const AA=new Lr;AA.position.x=0,AA.add(H,D),g.add(AA);const iA=r==="next"?-Math.PI:Math.PI,k=860,G=Math.min(70,s*.06);await new Promise(W=>{const R=performance.now();function V(rA){const w=Math.min(1,(rA-R)/k),_=XB(w);AA.rotation.y=iA*_;const b=Math.sin(_*Math.PI)*G,O=x.attributes.position;for(let F=0;F<O.count;F++){const Z=(I[F*3]+s/2)/s;O.setZ(F,Math.sin(Z*Math.PI)*b)}O.needsUpdate=!0,x.computeVertexNormals(),p.position.x=-a*.3+Math.sin(_*Math.PI)*a*.25,f.render(g,m),w<1?requestAnimationFrame(V):W()}requestAnimationFrame(V)}),f.dispose(),x.dispose(),M.dispose(),L.dispose(),T.dispose(),S.dispose(),v.remove()}export{YB as isWebglAvailable,JB as playFlip};
//# sourceMappingURL=flip3d-ccr2uH8b.js.map
