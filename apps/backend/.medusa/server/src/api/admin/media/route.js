"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const path_1 = __importDefault(require("path"));
const MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
};
async function POST(req, res) {
    const { filename, data, folder, oldUrl } = req.body;
    if (!filename || !data) {
        return res.status(400).json({ message: "filename and data are required" });
    }
    const fileService = req.scope.resolve(utils_1.Modules.FILE);
    if (oldUrl) {
        const base = process.env.S3_FILE_URL?.replace(/\/$/, "");
        if (base && oldUrl.startsWith(base + "/")) {
            const oldKey = decodeURIComponent(oldUrl.slice(base.length + 1));
            try {
                await fileService.deleteFiles([oldKey]);
            }
            catch {
                // non-fatal: old file may already be gone
            }
        }
    }
    const fullFilename = folder ? `${folder}/${filename}` : filename;
    const ext = path_1.default.extname(filename).toLowerCase();
    const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";
    const [uploaded] = await fileService.createFiles([
        {
            filename: fullFilename,
            mimeType,
            content: data,
            access: "public",
        },
    ]);
    res.json({ url: uploaded.url });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL21lZGlhL3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBY0Esb0JBd0NDO0FBckRELHFEQUFtRDtBQUNuRCxnREFBdUI7QUFFdkIsTUFBTSxVQUFVLEdBQTJCO0lBQ3pDLE1BQU0sRUFBRSxZQUFZO0lBQ3BCLE9BQU8sRUFBRSxZQUFZO0lBQ3JCLE1BQU0sRUFBRSxXQUFXO0lBQ25CLE1BQU0sRUFBRSxXQUFXO0lBQ25CLE9BQU8sRUFBRSxZQUFZO0lBQ3JCLE1BQU0sRUFBRSxlQUFlO0lBQ3ZCLE1BQU0sRUFBRSxpQkFBaUI7Q0FDMUIsQ0FBQTtBQUVNLEtBQUssVUFBVSxJQUFJLENBQUMsR0FBa0IsRUFBRSxHQUFtQjtJQUNoRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLElBSzlDLENBQUE7SUFFRCxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxDQUFDLENBQUE7SUFDNUUsQ0FBQztJQUVELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUVuRCxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ1gsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUN4RCxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFDLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2hFLElBQUksQ0FBQztnQkFDSCxNQUFNLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1lBQ3pDLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ1AsMENBQTBDO1lBQzVDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtJQUNoRSxNQUFNLEdBQUcsR0FBRyxjQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ2hELE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSwwQkFBMEIsQ0FBQTtJQUU5RCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxXQUFXLENBQUMsV0FBVyxDQUFDO1FBQy9DO1lBQ0UsUUFBUSxFQUFFLFlBQVk7WUFDdEIsUUFBUTtZQUNSLE9BQU8sRUFBRSxJQUFJO1lBQ2IsTUFBTSxFQUFFLFFBQVE7U0FDakI7S0FDRixDQUFDLENBQUE7SUFFRixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBQ2pDLENBQUMifQ==