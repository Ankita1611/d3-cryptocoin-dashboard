import React from 'react';

export default function PopUp(props) {
  return (
    <div id="pop-up" className="modal fade" role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal">&times;</button>
            <h4 className="modal-title">{props.headerText}</h4>
          </div>
          <div className="modal-body">
            <p>{props.bodyText}</p>
          </div>
          <div className="modal-footer" onClick={props.confirmAction}>
            <button className="btn btn-default" data-dismiss="modal" data-variant="confirm">Yes</button>
            <button type="button" className="btn btn-default" data-dismiss="modal" data-variant="cancel">No</button>
          </div>
        </div>
      </div>
    </div>
  );
}