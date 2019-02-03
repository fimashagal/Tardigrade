"use strict";
(() => {


    const TardigradeStoreRegistry = {},
          TardigradeNameSpace = [ "_reflects", "_states", "_registry", "_volumes" ];

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
            return {
                volume: volume,
                type: Typo.typeOf(volume)
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
    }


    /* Store constructor */

    class TardigradeStore {
        constructor(options = {}){
            this.key = Util.hash();
            this._reflects = {};
            this._states = {
                initialized: false
            };
            this._registry = {
                ranged: [],
                locked: []
            };
            this._volumes = {};
            return this.initialize(options);
        }

        initialize(options = {}){
            if(!this._states.initialized){
                if(Typo.isObject(options) && Object.entries(options).length){

                    let {key} = options;

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
            if(!TardigradeNameSpace.includes(key) && Typo.isScalar(volume) && Typo.isntDef(this._volumes[key])){
                const scope = this;
                this._volumes[key] = Interface.volume(volume);
                Object.defineProperties(this, {
                    [key]: {
                        get(){
                            return scope._volumes[key].volume;
                        },
                        set(value){
                            let volumeItem = scope._volumes[key];
                            if(Typo.typeOf(value) === volumeItem.type && value !== volumeItem.volume){
                                volumeItem.volume = value;
                                scope._callReflect(key);
                                return true;
                            }
                        }
                    }
                });
            }
        }

        removeVolume(key){

        }

        addReflect(key, reflect){

        }

        removeReflect(key){

        }

        addRange(key, range){

        }

        removeRange(key){

        }

        addLock(key){

        }

        removeLock(key){

        }

        retypeVolume(key, type){

        }

        is(key){

        }

        isnt(key){

        }

        _callReflect(key){
            console.log(`Reflect for ${key}`);
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

