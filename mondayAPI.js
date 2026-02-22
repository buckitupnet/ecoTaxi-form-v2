// Monday.com API Client (Text Only - No File Uploads)
import { CONFIG } from './config.js';

export class MondayAPI {
    constructor() {
        this.boardId = CONFIG.MONDAY.BOARD_ID;
        this.workerUrl = CONFIG.MONDAY.WORKER_URL;
        this.apiKey = CONFIG.MONDAY.MAIN_KEY;
    }

    async createItem(formData, selectedDates) {
        console.log('📤 Creating Monday.com item...');
        
        const itemName = `Order from ${formData.get('email')}`;
        const text = this.generateText(formData, selectedDates);
        
        const payload = {
            query: `
                mutation CreateItem($boardId: ID!, $itemName: String!, $columnVals: JSON!) {
                    create_item(
                        board_id: $boardId
                        item_name: $itemName
                        column_values: $columnVals
                    ) {
                        id
                    }
                }
            `,
            variables: {
                boardId: this.boardId,
                itemName: itemName,
                columnVals: JSON.stringify({
                    dup__of_name: formData.get('address'),
                    email0: formData.get('email'),
                    phone: {
                        phone: formData.get('phone').replace(/\s/g, ''),
                        countryShortName: 'GE'
                    },
                    dropdown: formData.get('area'),
                    dup__of_language: formData.get('tariff'),
                    dup__of_tariff: formData.get('payment'),
                    text9: formData.get('comment') || '',
                    text3: formData.get('quantity') || '1',
                    text0: selectedDates.join(', ')
                })
            }
        };

        try {
            const response = await fetch(`${this.workerUrl}/item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.apiKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Monday.com Error:', errorText);
                throw new Error(`Monday.com request failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Monday.com item created');
            return result;
        } catch (error) {
            console.error('❌ Monday.com error:', error);
            // Don't fail the whole submission if Monday.com fails
            console.warn('⚠️  Continuing without Monday.com...');
            return null;
        }
    }

    generateText(formData, selectedDates) {
        const paymentMethods = {
            '1': 'Cash',
            '2': 'Transfer to account',
            '3': 'Invoice'
        };

        return [
            `Date: ${selectedDates.join(', ')}`,
            `Area: ${formData.get('area')}`,
            `Address: ${formData.get('address')}`,
            `Email: ${formData.get('email')}`,
            `Phone: ${formData.get('phone')}`,
            `Quantity: ${formData.get('quantity') || '1'}`,
            `Tariff: ${formData.get('tariff')}`,
            `Payment: ${paymentMethods[formData.get('payment')]}`,
            formData.get('comment') ? `Comment: ${formData.get('comment')}` : ''
        ].filter(Boolean).join('\n\n');
    }
}
