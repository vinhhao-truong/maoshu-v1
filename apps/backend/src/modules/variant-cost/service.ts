import { MedusaService } from "@medusajs/framework/utils"
import VariantCost from "./models/variant-cost"

class VariantCostModuleService extends MedusaService({ VariantCost }) {}

export default VariantCostModuleService
