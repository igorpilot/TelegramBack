const StoreModel = require("../models/store-model");
const ExcelJS = require("exceljs");

class ExcelService {
    async exportInventory(storeId) {
        try {
            const store = await StoreModel.findById(storeId);

            if (!store) {
                return res.status(404).json({error: "Магазин не знайдено"});
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Склад');

            const sumPurchaseTotal = store.rowsAll.reduce((sum, row) => sum + row.purchaseTotal, 0);

            const row = worksheet.addRow([
                '','', '', '', '', '', '', 'Сума закупок: ',  sumPurchaseTotal, '', '', ''
            ]);
            row.getCell(8).font = { bold: true };
            row.getCell(9).font = { bold: true };

            const header = [
                'ID', 'Категорія', 'Назва', 'Опис', 'Бренд', 'Країна', 'Кількість',
                'Ціна закупки', 'Сума закупки', 'Націнка', 'Ціна продажу', 'Штрих-код'
            ];
            worksheet.addRow(header);

            header.forEach((headerName, index) => {
                const column = worksheet.getColumn(index + 1);
                column.width = Math.max(headerName.length, 15);
            });

            store.rowsAll.forEach(row => {
                worksheet.addRow([
                    row.id, row.category, row.name, row.description, row.brand,
                    row.country, row.quantity, row.purchasePrice, row.purchaseTotal,
                    row.profitPrice, row.sellingPrice, row.code
                ]);
            });
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer;
        } catch (e) {
            console.log("❌ Помилка в exportInventory():", e)
        }
    }
}

module.exports = new ExcelService();