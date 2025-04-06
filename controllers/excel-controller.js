import StoreModel from '../models/store-model.js';
import ExcelService from '../service/excel-service.js';

class ExcelController {

    async exportInventory(req, res) {
        try {
            const storeId = req.params.storeId;
            const buffer = await ExcelService.exportInventory(storeId);
            const store = await StoreModel.findById(storeId);
            const fileName = `Склад магазину_${store.title}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            const encodedFileName = encodeURIComponent(fileName);
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${encodedFileName}"`
            );
            res.send(buffer);
        } catch (error) {
            console.error("❌ Помилка експорту:", error);
            res.status(500).json({error: "Помилка експорту даних"});
        }
    };
}

export default  new ExcelController();