function showConfirmBox() {
    let box = new ConfirmBox("Delete", "Are you sure to delete something expensive?", () => {
        box.showButtonLoading(0, true);
        setTimeout(() => {
            box.dismiss();
            LayerManager.getInstance().showSnackbar("Successfully deleted!");
        }, 1000);
    });
    box.show();
}

function showMessageBox() {
    let box = new MessageBox("Test", "Message", lang("Close"));
    box.show();
}

function showMessageBoxWithLoader() {
    LayerManager.getInstance().showBoxLoader();
    setTimeout(showMessageBox, 1000);
}

function showScrollableBox() {
    let str = "";

    for (let i = 0; i < 100; i++) {
        str += "Lorem ipsum dolor sit amet, the quick brown fox jumps over the lazy dog. ";
    }

    let box = new ScrollableBox("Test");
    box.setContent(UI.createElement("div", { innerText: str }));
    box.setCloseable(true);
    box.show();
}

function showSnackbar() {
    LayerManager.getInstance().showSnackbar("Lorem ipsum dolor sit amet, the quick brown fox jumps over the lazy dog.");
}

function testMessageBoxFromServer() {
    LayerManager.getInstance().showBoxLoader();
    Ajax.getAndApplyActions(`${config.baseUrl}/ajax_message_box_test`);
}