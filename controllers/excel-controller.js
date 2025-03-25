const StoreModel = require("../models/store-model");
const ExcelService = require('../service/excel-service');
class ExcelController {

    async exportInventory(req, res) {
        try {
            const storeId = req.params.storeId;
            const buffer = await ExcelService.exportInventory(storeId);
            const store = await StoreModel.findById(storeId);
            const fileName = `Склад магазину_${store.title}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            const encodedFileName = encodeURIComponent(fileName);
            console.log("Назва магазину:", store.title);
            console.log("Форматований файл:", fileName);
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

module.exports = new ExcelController();