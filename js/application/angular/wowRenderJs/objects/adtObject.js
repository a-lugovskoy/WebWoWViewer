import mathHelper from './../math/mathHelper.js';

class ADTObject {
    constructor(sceneApi, wdtFile) {
        this.sceneApi = sceneApi;
        this.m2Array = [];
        this.drawChunk = new Array(256);
        this.aabbs = [];
        for (var i = 0; i < 256; i++) this.drawChunk[i] = true;
    }

    checkFrustumCulling (cameraVec4, frustumPlanes, num_planes) {
        for (var i = 0; i < 256; i++) {
            var aabb = this.aabbs[i];
            if (!aabb) continue;

            //1. Check if camera position is inside Bounding Box
            if (
                cameraVec4[0] > aabb[0][0] && cameraVec4[0] < aabb[1][0] &&
                cameraVec4[1] > aabb[0][1] && cameraVec4[1] < aabb[1][1] &&
                cameraVec4[2] > aabb[0][2] && cameraVec4[2] < aabb[1][2]
            ) {
                this.drawChunk[i] = true;
                continue;
            }

            //2. Check aabb is inside camera frustum
            var result = mathHelper.checkFrustum(frustumPlanes, aabb, num_planes);
            this.drawChunk[i] = result;
        }
    }

    calcBoundingBoxes() {
        var aabbs = new Array(256);
        var adtFile = this.adtGeom.adtFile;
        for(var i = 0 ; i < 256; i++) {
            var mcnk = adtFile.mcnkObjs[i];

            //Loop over heights
            var minZ = 999999;
            var maxZ = -999999;
            for (var j = 0; j < mcnk.heights.length; j++) {
                var heightVal = mcnk.heights[j];
                if (minZ > heightVal) minZ = heightVal;
                if (maxZ < heightVal) maxZ = heightVal;
            }

            var minX = mcnk.pos.x - (533.3433333 / 16.0);
            var maxX = mcnk.pos.x;
            var minY = mcnk.pos.y - (533.3433333 / 16.0);
            var maxY = mcnk.pos.y;
            minZ += mcnk.pos.z;
            maxZ += mcnk.pos.z;

            aabbs[i] = [[minX, minY, minZ], [maxX, maxY, maxZ]];
        }

        this.aabbs = aabbs;
    }

    loadM2s() {
        var self = this;
        var m2Positions = this.adtGeom.adtFile.mddf;
        if (!m2Positions) return;

        this.m2Array = [];
        for (var i = 0; i < m2Positions.length; i++) {
            //for (var i = 0; i < (doodadsSet.doodads.length > 10) ? 10 : doodadsSet.doodads.length; i++) {
            var doodad = m2Positions[i];
            //this.loadM2(i, doodad);
            this.sceneApi.objects.loadAdtM2Obj(doodad);
        }
    }

    loadWmos() {
        var self = this;
        var wmoPositions = this.adtGeom.adtFile.wmoObjs;
        if (!wmoPositions) return;


        this.wmoArray = [];
        wmoPositions.forEach(function (wmoDef) {
            self.sceneApi.objects.loadAdtWmo(wmoDef);
        });
    }

    load(modelName) {
        var self = this;

        var adtPromise = this.sceneApi.resources.loadAdtGeom(modelName);
        adtPromise.then(function (result) {
            self.adtGeom = result;

            self.loadM2s();
            self.loadWmos();
            self.calcBoundingBoxes();
        });
    }

    draw(deltaTime) {
        if (this.adtGeom) {
            this.adtGeom.draw(this.drawChunk);
        }
    }
}
export default ADTObject;