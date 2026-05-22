import { Modules, ModuleProvider } from "@medusajs/framework/utils"
import { SupabaseFileService } from "./service"

export default ModuleProvider(Modules.FILE, {
  services: [SupabaseFileService],
})
