import { MedusaService } from "@medusajs/framework/utils"
import BusinessInfo from "./models/business-info"

class BusinessInfoModuleService extends MedusaService({ BusinessInfo }) {}

export default BusinessInfoModuleService
