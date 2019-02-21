"use strict";
(() => {

    const TardigradeStoreRegistry = {},
          TardigradeNameSpace = [ "_reflects", "_states", "_volumes" ];

    /* Util */
    class Util {
        static hash(){
            return btoa(`${Math.round(Date.now() / Math.random())}`)
                    .replace(/=/g, '')
                    .toLowerCase();
        }
        static warn(message = "Unknown warn!"){
            console.warn(`Tardigrade: ${message.toString()}`);
        }
    }

    /* Interfaces */

    class Interface {
        static volume(volume){
            const type = Typo.typeOf(volume);
            const response = {
                volume: volume,
                type: type,
                lock: {
                    state: false
                }
            };
            if(type === "number"){
                response.range = Interface.range();
            }
            return response;
        }

        static nx(n = 0, x = 1){
            return [n, x];
        }

        static overflowReflects(min, max){
            return {min, max};
        }

        static range(state = false, nx = [0, 1], reflects = {min: null, max: null}){
            const [n, x] = nx,
                  {min, max} = reflects;
            return {
                state: false,
                nx: Interface.nx(n, x),
                overflowReflects: Interface.overflowReflects(min, max)
            };
        }
    }

    /* In-build type detector */

    class Typo {
        static typeOf(object = null){
            return Object.prototype.toString
                    .call(object)
                    .replace(/^\[object (.+)\]$/, '$1')
                    .toLowerCase();
        }
        static isObject(object = null){
            return Typo.typeOf(object) === "object";
        }
        static isDef(object = null){
            return Typo.typeOf(object) !== "undefined" && Typo.typeOf(object) !== "null";
        }
        static isntDef(object = null){
            return !Typo.isDef(object);
        }
        static isString(object = null){
            return Typo.typeOf(object) === "string";
        }
        static isNumber(object = null){
            return Typo.typeOf(object) === "number";
        }
        static isBoolean(object = null){
            return Typo.typeOf(object) === "boolean";
        }
        static isScalar(object = null){
            return Typo.isNumber(object) || Typo.isString(object) || Typo.isBoolean(object);
        }
        static isFn(object = null){
            return Typo.typeOf(object) === "function";
        }
    }


    /* Store constructor */

    class TardigradeStore {
        constructor(options = {}){
            this.key = Util.hash();
            this._reflects = {};
            this._states = {
                initialized: false
            };
            this._volumes = {};
            return this.initialize(options);
        }

        initialize(options = {}){
            if(!this._states.initialized){
                if(Typo.isObject(options) && Object.entries(options).length){
                    const {key} = options;
                    if(Typo.isString(key) && key.length){
                        this.key = key;
                        delete options.key;
                    }
                    for(let [key, volume] of Object.entries(options)){
                        this.addVolume(key, volume);
                    }
                }
                this._states.initialized = true;
            }
            return this;
        }

        addVolume(key, volume){
            if(!TardigradeNameSpace.includes(key)
                && Typo.isScalar(volume)
                && !this.isVolumeExist(key)){
                    this._volumes[key] = Interface.volume(volume);
                    this._addDescriptor(key);
            }
            return this;
        }

        isVolumeExist(key){
            return Object.keys(this._volumes)
                         .includes(key)
        }

        isReflectExist(key){
            return Object.keys(this._reflects)
                         .includes(key);
        }

        addReflect(key, reflect){
            if(this.isVolumeExist(key) && Typo.isFn(reflect)){
                this._reflects[key] = reflect;
            }
            return this;
        }

        removeReflect(key){
            if(this.isReflectExist(key)){
                delete this._reflects[key];
            }
            return this;
        }

        addRange(key, range = Interface.nx(0, 1)){
            if(!this.isVolumeExist(key)
                || this._volumes[key].type !== "number"
                || !Array.isArray(range)
                || range.length !== 2
                || range.some(item => !Typo.isNumber(item))){
                    return this;
            }
            const volume = this._volumes[key];
            volume.range.state = true;
            volume.range.nx = range;
            return this;
        }

        removeRange(key){
            if(!this.isVolumeExist(key)){
                return this;
            }
            return this;
        }

        isRanged(key){
            if(!this.isVolumeExist(key)){
                return false;
            }
            const {type, range} = this._volumes[key];
            return type === "number" && range.state;
        }

        addLock(key){

        }

        removeLock(key){

        }

        isLocked(key){

        }

        is(key, reverseCallback){

        }

        isnt(key, reverseCallback){

        }

        _callReflect(key){
            if(this.isReflectExist(key)){
                this._reflects[key](this._volumes[key].volume);
            }
            return this;
        }

        _addDescriptor(key){
            const scope = this;
            Object.defineProperties(this, {
                [key]: {
                    get(){
                        return scope._volumes[key].volume;
                    },
                    set(value){
                        let volumeItem = scope._volumes[key];
                        if(Typo.typeOf(value) === volumeItem.type){
                            if(scope.isRanged(key)){
                                value = scope._holdInRange(value, volumeItem.range.nx);
                            }
                            if(value !== volumeItem.volume){
                                volumeItem.volume = value;
                                scope._callReflect(key);
                            }
                            return true;
                        }
                    }
                }
            });
            return this;
        }

        _holdInRange(value, [n, x] = Interface.nx(0, 1)){
            if(value < n) {
                value = n;
            }
            if(value > x){
                value = x;
            }
            return value;
        }



    }

    /* Store constructor */

    class Tardigrade {
        static isScalar(volume = null){
            return Typo.isScalar(volume);
        }
        static typeOf(object = null){
            return Typo.typeOf(object);
        }
        static query(...keys){
            const response = [];
            if(!keys.length){
                return [];
            }
            for(let key of keys){
                key = key.toString();
                if(TardigradeStoreRegistry.hasOwnProperty(key)){
                    response.push(TardigradeStoreRegistry[key]);
                }
            }
            return response;
        }

        static queryAll(){
            return Object.values(TardigradeStoreRegistry);
        }

        static create(...args){
            if(!args.length){
                Util.warn("Add object or few for store creating");
            }

            if(args.length === 1){
                let instance = Typo.isObject(args[0]) ? new TardigradeStore(args[0]) : null;
                if(Typo.isDef(instance)){
                    TardigradeStoreRegistry[instance.key] = instance;
                }
            }

            if(args.length > 1){
                let response = [];
                for(let arg of args) {
                    let instance = Typo.isObject(arg) ? new TardigradeStore(arg) : null;
                    if(Typo.isDef(instance)){
                        TardigradeStoreRegistry[instance.key] = instance;
                        response.push(TardigradeStoreRegistry[instance.key]);
                    }
                }
            }
            return this;
        }

        static remove(...keys){
            if(!keys.length) {
                Util.warn("Nothing was deleted");
                return;
            }
            if(keys.length === 1 && Typo.isDef(keys[0]) && TardigradeStoreRegistry.hasOwnProperty(keys[0].toString())){
                delete TardigradeStoreRegistry[keys[0].toString()];
            }
            if(keys.length > 1){
                for(let key of keys){
                    if(Typo.isDef(key) && TardigradeStoreRegistry.hasOwnProperty(key.toString())){
                        delete TardigradeStoreRegistry[key];
                    }
                }
            }
            return this;
        }
    }

    window.Tardigrade = Tardigrade;

})();

