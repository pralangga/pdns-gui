function TemplateWindow()
{
  var win_id = get_win_id();
  if (!win_id) return;
  
  var Tabs = new Ext.TabPanel({
    activeTab: 0,
    border: false,
    deferredRender: false,
    enableTabScroll:true,
    layoutOnTabChange: true,
    plain: true,
    height: 360
  });
  
  if (TemplateStore.getCount() == 0)
  {
    Tabs.add(emptyTemplate());
  }
  else
  {
    TemplateStore.each(function(r){
      Tabs.add(existingTemplate(r.data));
    });
  }
  
  Tabs.doLayout();
  
  var win = new Ext.ux.Window({
    id: win_id,
    title: 'Templates',
    width: 450,
    items: Tabs,
    doSubmit: function(){
      
      var form_count = 0;
      
      var errors = '';
      
      Ext.each(Tabs.items.items[0], function(form)
      {
        // remove all hidden fields
        Ext.each(form.find('xtype','hidden'),function(hidden){
          if (hidden.name != 'id')
          {
            form.remove(hidden);
          }
        });
        
        form.doLayout();
        
        var grid = form.items.items[form.items.items.length-1];
        
        var i = 0;
        grid.store.each(function(r){
          
          console.log(r);
          
          form.add({
            xtype: 'hidden',
            name: 'record['+i+'][id]',
            value: r.data.id
          });
          
          form.add({
            xtype: 'hidden',
            name: 'record['+i+'][name]',
            value: r.data.name
          });
          
          form.add({
            xtype: 'hidden',
            name: 'record['+i+'][type]',
            value: r.data.type
          });
          
          form.add({
            xtype: 'hidden',
            name: 'record['+i+'][content]',
            value: r.data.content
          });
          
          form.add({
            xtype: 'hidden',
            name: 'record['+i+'][ttl]',
            value: r.data.ttl
          });
          
          form.add({
            xtype: 'hidden',
            name: 'record['+i+'][prio]',
            value: r.data.prio
          });
          
          i++;
        });
        
        form.doLayout();
        
        form.form.submit({
          success: function(form, action){
            
            form_count++;
            
            if (form_count == Tabs.items.items.length)
            {
              win.close();
              
              Ext.Msg.alert('Info',action.result.info);
              
              TemplateStore.load();
            }
          },
          failure: function(form, action){
            
            form_count++;
            
            console.log(action);
            console.log(form);
            
            errors+= 'Template: ' + form.title + '<br/>';
            errors+= action.result.errors.record;
            
            if (form_count == Tabs.items.items.length)
            {
              Ext.Msg.alert('Error',errors);
            }
          }
        });
      });
      
    },
    buttons: [
      {
        text: 'Close',
        handler: function() { win.close() }
      },{
        text: 'Submit',
        handler: function() { win.doSubmit() }
      }
    ]
  });
  
  win.show();
}

function emptyTemplate(template)
{ 
  var form = new Ext.form.FormPanel({
    title: 'Default',
    url: '<?php echo url_for('template/add') ?>',
    border: false,
    labelWidth: 60,
    bodyStyle: 'padding: 10px;',
    items: [
      {
        xtype: 'textfield',
        fieldLabel: 'Name',
        name: 'name',
        allowBlank: false,
        value: 'Default'
      },{
        xtype: 'combo',
        store: [["NATIVE","Native"],["MASTER","Master"],["SLAVE","Slave"]],
        fieldLabel: 'Type',
        displayField: 'field2',
        valueField: 'field1',
        width: 120,
        name: 'type',
        hiddenName: 'type',
        mode: 'local',
        triggerAction: 'all',
        forceSelection: true,
        editable: false,
        allowBlank: false,
        emptyText: 'Please select...'
      },
        new Ext.ux.RecordsGrid()
    ]
  });
  
  return form;
}


function existingTemplate(template)
{ 
  var form = new Ext.form.FormPanel({
    title: template.name,
    url: '<?php echo url_for('template/edit') ?>',
    border: false,
    labelWidth: 60,
    bodyStyle: 'padding: 10px;',
    items: [
      {
        xtype: 'hidden',
        name: 'id',
        value: template.id
      },{
        xtype: 'textfield',
        fieldLabel: 'Name',
        name: 'name',
        allowBlank: false,
        value: template.name
      },{
        xtype: 'combo',
        store: [["NATIVE","Native"],["MASTER","Master"],["SLAVE","Slave"]],
        fieldLabel: 'Type',
        displayField: 'field2',
        valueField: 'field1',
        width: 120,
        name: 'type',
        hiddenName: 'type',
        mode: 'local',
        triggerAction: 'all',
        forceSelection: true,
        editable: false,
        allowBlank: false,
        value: template.type
      },
        new Ext.ux.RecordsGrid({records: template.records})
    ]
  });
  
  return form;
}
