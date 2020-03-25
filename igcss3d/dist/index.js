"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
function requestHTTP(url) {
    return __awaiter(this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            request = new XMLHttpRequest();
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    request.onreadystatechange = function () {
                        if (request.readyState !== 4)
                            return;
                        if (request.status >= 200 && request.status < 300) {
                            resolve(request.responseText);
                        }
                        else {
                            reject({
                                status: request.status,
                                statusText: request.statusText
                            });
                        }
                    };
                    request.open('GET', url, true);
                    request.send();
                })];
        });
    });
}
;
function processIgEmbedResponse(response) {
    var parsed_resp = JSON.parse(response);
    console.log(parsed_resp);
    var el = document.createElement('div');
    el.innerHTML = parsed_resp.html;
    return el.firstChild;
}
var vidurl = "http://api.instagram.com/oembed/?omitscript=true&url=http://www.instagram.com/p/";
var imgurl1 = "https://instagram.com/p/";
var imgurl2 = "/media/?size=m";
// though this returns the right element, you must call 
// instgrm.Embeds.process(); elsewhere for videos to render!
// images need no call to embeds
function parseEntry(post) {
    return __awaiter(this, void 0, void 0, function () {
        var embedResponseText, img;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!post[1]) return [3 /*break*/, 2];
                    return [4 /*yield*/, requestHTTP(vidurl + post[0])];
                case 1:
                    embedResponseText = _a.sent();
                    return [2 /*return*/, processIgEmbedResponse(embedResponseText)];
                case 2:
                    img = document.createElement('img');
                    img.src = imgurl1 + post[0] + imgurl2;
                    return [2 /*return*/, img];
            }
        });
    });
}
exports.parseEntry = parseEntry;
