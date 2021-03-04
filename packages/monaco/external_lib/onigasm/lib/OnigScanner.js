"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
    value: true
});

var LRUCache = require("lru-cache");

var onigasmH_1 = require("./onigasmH");

var OnigString_1 = require("./OnigString");
/**
 * Allocates space on the heap and copies the string bytes on to it
 * @param str
 * @returns pointer to the first byte's address on heap
 */


function mallocAndWriteString(str) {
    var ptr = onigasmH_1.onigasmH._malloc(str.utf8Bytes.length);

    onigasmH_1.onigasmH.HEAPU8.set(str.utf8Bytes, ptr);
    return ptr;
}

function convertUTF8BytesFromPtrToString(ptr) {
    var chars = [];
    var i = 0;

    while (onigasmH_1.onigasmH.HEAPU8[ptr] !== 0x00) {
        chars[i++] = onigasmH_1.onigasmH.HEAPU8[ptr++];
    }

    return chars.join();
}

var cache = new LRUCache({
    dispose: function dispose(scanner, info) {
        var regexTPtrsPtr = onigasmH_1.onigasmH._malloc(info.regexTPtrs.length);

        onigasmH_1.onigasmH.HEAPU8.set(info.regexTPtrs, regexTPtrsPtr);

        var status = onigasmH_1.onigasmH._disposeCompiledPatterns(regexTPtrsPtr, scanner.patterns.length);

        if (status !== 0) {
            var errMessage = convertUTF8BytesFromPtrToString(onigasmH_1.onigasmH._getLastError());
            throw new Error(errMessage);
        }

        onigasmH_1.onigasmH._free(regexTPtrsPtr);
    },
    max: 1000
});

var OnigScanner = /*#__PURE__*/function () {
    /**
     * Create a new scanner with the given patterns
     * @param patterns  An array of string patterns
     */
    function OnigScanner(patterns) {
        _classCallCheck(this, OnigScanner);

        if (onigasmH_1.onigasmH === null) {
            throw new Error("Onigasm has not been initialized, call loadWASM from 'onigasm' exports before using any other API");
        }

        for (var i = 0; i < patterns.length; i++) {
            var pattern = patterns[i];

            if (typeof pattern !== 'string') {
                throw new TypeError("First parameter to OnigScanner constructor must be array of (pattern) strings");
            }
        }

        this.sources = patterns.slice();
    }

    _createClass(OnigScanner, [{
        key: "findNextMatch",

        /**
         * Find the next match from a given position
         * @param string The string to search
         * @param startPosition The optional position to start at, defaults to 0
         * @param callback The (error, match) function to call when done, match will null when there is no match
         */
        value: function findNextMatch(string, startPosition, callback) {
            if (startPosition == null) {
                startPosition = 0;
            }

            if (typeof startPosition === 'function') {
                callback = startPosition;
                startPosition = 0;
            }

            try {
                var match = this.findNextMatchSync(string, startPosition);
                callback(null, match);
            } catch (error) {
                callback(error);
            }
        }
        /**
         * Find the next match from a given position
         * @param string The string to search
         * @param startPosition The optional position to start at, defaults to 0
         */

    }, {
        key: "findNextMatchSync",
        value: function findNextMatchSync(string, startPosition) {
            if (startPosition == null) {
                startPosition = 0;
            }

            startPosition = this.convertToNumber(startPosition);
            var onigNativeInfo = cache.get(this);
            var status = 0;

            if (!onigNativeInfo) {
                var regexTAddrRecieverPtr = onigasmH_1.onigasmH._malloc(4);

                var regexTPtrs = [];

                for (var i = 0; i < this.sources.length; i++) {
                    var pattern = this.sources[i];
                    var patternStrPtr = mallocAndWriteString(new OnigString_1.default(pattern));
                    status = onigasmH_1.onigasmH._compilePattern(patternStrPtr, regexTAddrRecieverPtr);

                    if (status !== 0) {
                        var errMessage = convertUTF8BytesFromPtrToString(onigasmH_1.onigasmH._getLastError());
                        throw new Error(errMessage);
                    }

                    var regexTAddress = onigasmH_1.onigasmH.HEAP32[regexTAddrRecieverPtr / 4];
                    regexTPtrs.push(regexTAddress);

                    onigasmH_1.onigasmH._free(patternStrPtr);
                }

                onigNativeInfo = {
                    regexTPtrs: new Uint8Array(Uint32Array.from(regexTPtrs).buffer)
                };

                onigasmH_1.onigasmH._free(regexTAddrRecieverPtr);

                cache.set(this, onigNativeInfo);
            }

            var onigString = _instanceof(string, OnigString_1.default) ? string : new OnigString_1.default(this.convertToString(string));
            var strPtr = mallocAndWriteString(onigString);

            var resultInfoReceiverPtr = onigasmH_1.onigasmH._malloc(8);

            var regexTPtrsPtr = onigasmH_1.onigasmH._malloc(onigNativeInfo.regexTPtrs.length);

            onigasmH_1.onigasmH.HEAPU8.set(onigNativeInfo.regexTPtrs, regexTPtrsPtr);
            status = onigasmH_1.onigasmH._findBestMatch( // regex_t **patterns
                regexTPtrsPtr, // int patternCount
                this.sources.length, // UChar *utf8String
                strPtr, // int strLen
                onigString.utf8Bytes.length - 1, // int startOffset
                onigString.convertUtf16OffsetToUtf8(startPosition), // int *resultInfo
                resultInfoReceiverPtr);

            if (status !== 0) {
                var _errMessage = convertUTF8BytesFromPtrToString(onigasmH_1.onigasmH._getLastError());

                throw new Error(_errMessage);
            }

            var _Uint32Array = new Uint32Array(onigasmH_1.onigasmH.HEAPU32.buffer, resultInfoReceiverPtr, 3),
                _Uint32Array2 = _slicedToArray(_Uint32Array, 3),
                // The index of pattern which matched the string at least offset from 0 (start)
                bestPatternIdx = _Uint32Array2[0],
                // Begin address of capture info encoded as pairs
                // like [start, end, start, end, start, end, ...]
                //  - first start-end pair is entire match (index 0 and 1)
                //  - subsequent pairs are capture groups (2, 3 = first capture group, 4, 5 = second capture group and so on)
                encodedResultBeginAddress = _Uint32Array2[1],
                // Length of the [start, end, ...] sequence so we know how much memory to read (will always be 0 or multiple of 2)
                encodedResultLength = _Uint32Array2[2];

            onigasmH_1.onigasmH._free(strPtr);

            onigasmH_1.onigasmH._free(resultInfoReceiverPtr);

            onigasmH_1.onigasmH._free(regexTPtrsPtr);

            if (encodedResultLength > 0) {
                var encodedResult = new Uint32Array(onigasmH_1.onigasmH.HEAPU32.buffer, encodedResultBeginAddress, encodedResultLength);
                var captureIndices = [];
                var _i2 = 0;
                var captureIdx = 0;

                while (_i2 < encodedResultLength) {
                    var index = captureIdx++;
                    var start = encodedResult[_i2++];
                    var end = encodedResult[_i2++];

                    if (onigString.hasMultiByteCharacters) {
                        start = onigString.convertUtf8OffsetToUtf16(start);
                        end = onigString.convertUtf8OffsetToUtf16(end);
                    }

                    captureIndices.push({
                        end: end,
                        index: index,
                        length: end - start,
                        start: start
                    });
                }

                onigasmH_1.onigasmH._free(encodedResultBeginAddress);

                return {
                    captureIndices: captureIndices,
                    index: bestPatternIdx,
                    scanner: this
                };
            }

            return null;
        }
    }, {
        key: "convertToString",
        value: function convertToString(value) {
            if (value === undefined) {
                return 'undefined';
            }

            if (value === null) {
                return 'null';
            }

            if (_instanceof(value, OnigString_1.default)) {
                return value.content;
            }

            return value.toString();
        }
    }, {
        key: "convertToNumber",
        value: function convertToNumber(value) {
            value = parseInt(value, 10);

            if (!isFinite(value)) {
                value = 0;
            }

            value = Math.max(value, 0);
            return value;
        }
    }, {
        key: "patterns",
        get: function get() {
            return this.sources.slice();
        }
    }]);

    return OnigScanner;
}();

exports.OnigScanner = OnigScanner;
exports.default = OnigScanner;
